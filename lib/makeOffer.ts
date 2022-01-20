import { Provider } from '@ethersproject/abstract-provider'
import { WyvernV2 } from '@reservoir0x/sdk'
import { Weth } from '@reservoir0x/sdk/dist/common/helpers'
import { BigNumber, ContractTransaction, Signer } from 'ethers'
import { paths } from 'interfaces/apiTypes'
import setParams from './params'

/**
 * Get a wETH contract instance and the signers wETH balance
 * @param chainId The Ethereum chain ID (eg: 1 - Ethereum Mainnet,
 *  4 - Rinkeby Testnet)
 * @param provider An abstraction to access the blockchain data
 * @param signer An Ethereum signer object
 * @returns A wETH contract instance and the signers wETH balance
 */
async function getWeth(chainId: number, provider: Provider, signer: Signer) {
  const weth = new Weth(provider, chainId)
  const signerAddress = await signer.getAddress()
  try {
    const balance = BigNumber.from(await weth.getBalance(signerAddress))
    return { weth, balance }
  } catch (error) {
    console.error("Could not get the signer's wETH balance", error)
    return null
  }
}

/**
 * In order to fill any orders, the Wyvern Token Transfer
 * Proxy must have an allowance to spend signer's wETH that
 * is greater than, or equal to the order value. Use this function
 * to check if the signer meets this requirement.
 * @param chainId The Ethereum chain ID (eg: 1 - Ethereum Mainnet,
 *  4 - Rinkeby Testnet)
 * @param weth A wrapped ETH (wETH) contract instance
 * @param input The user input offer value in wETH
 * @param signer An Ethereum signer object
 * @returns `true` if all conditions to continue are met and `false`
 * otherwise
 */
async function hasWethAllowance(
  chainId: number,
  weth: Weth,
  input: BigNumber,
  signer: Signer
) {
  const tokenTransferProxy =
    chainId === 4
      ? '0x82d102457854c985221249f86659c9d6cf12aa72'
      : '0xe5c783ee536cf5e63e792988335c4255169be4e1'

  try {
    const signerAddress = await signer.getAddress()
    // Get the allowance the signer gave to the Wyvern Token Transfer Proxy
    const allowance = await weth.getAllowance(signerAddress, tokenTransferProxy)

    if (input.gt(allowance)) {
      // If the allowance is not greater than or equal to the user's input,
      // approve the Token Transfer Proxy to spend the total supply of wETH
      let { wait } = (await weth.approve(
        signer,
        tokenTransferProxy,
        '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
      )) as ContractTransaction

      // Wait for the transaction to be mined
      await wait()
    }

    // The exchange has enough allowance
    return true
  } catch (error) {
    console.error('Could not approve wETH', error)
    return false
  }
}

/**
 * Check if the signer has enough wETH to post the current
 * offer to buy a token. If necessary, wrap the missing signer's ETH
 * @param signer An Ethereum signer object
 * @param missingWeth Amount of wETH the signer is missing to
 * make the current offer
 * @param weth A wrapped ETH (wETH) contract instance
 * @returns `true` if the signer has enough wETH, `false` otherwise
 */
export async function checkUserBalance(
  signer: Signer,
  missingWeth: BigNumber,
  weth: Weth
) {
  // The signer has enough wETH
  if (missingWeth.isZero()) return true

  try {
    // The signer doesn't have enough wETH
    // wrap the necessary ETH
    let { wait } = (await weth.deposit(
      signer,
      missingWeth
    )) as ContractTransaction

    // Wait for the transaction to be mined
    await wait()

    return true
  } catch (err) {
    console.error('Could not deposit wETH')
    return false
  }
}

/**
 * Post an offer to buy order to the Reservoir database
 * @param chainId The Ethereum chain ID (eg: 1 - Ethereum Mainnet,
 *  4 - Rinkeby Testnet)
 * @param apiBase The Reservoir's API base url
 * @param signer An Ethereum signer object
 * @param query The query object containing all order parameters
 * @returns The buy order if the order was successfully posted to Reservoir.
 * This order can be used to post an equivalent order to OpenSea.
 * Returns `null` otherwise
 */
async function postBuyOrder(
  chainId: number,
  apiBase: string,
  signer: Signer,
  query: paths['/orders/build']['get']['parameters']['query']
) {
  try {
    // Fetch order to Reservoir
    let url = new URL('/orders/build', apiBase)

    setParams(url, query)

    let res = await fetch(url.href)

    let { order } =
      (await res.json()) as paths['/orders/build']['get']['responses']['200']['schema']

    if (!order?.params) {
      throw 'There was an error fetching the order from the API'
    }

    // Instatiate a Wyvern order
    const buyOrder = new WyvernV2.Order(chainId, order.params)

    // Sign the order before posting to Reservoir
    await buyOrder.sign(signer)

    // Post buy order to Reservoir
    let url2 = new URL('/orders', apiBase)

    await fetch(url2.href, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orders: [{ kind: 'wyvern-v2', data: buyOrder.params }],
      }),
    })

    return buyOrder
  } catch (err) {
    console.error('Could not place the bid')
    return null
  }
}

/**
 * Post a buy order to OpenSea
 * @param chainId The Ethereum chain ID (eg: 1 - Ethereum Mainnet,
 *  4 - Rinkeby Testnet)
 * @param apiKey The OpenSea API key
 * @param orderParams The WyvernV2 order parameters
 * @param signer An Ethereum signer object
 * @param tokenId The token ID
 * @param contract The contract address for the token
 * @returns The response from the OpenSea API or `null` if
 * there was a failure posting the order
 */
async function postBuyOrderToOpenSea(
  chainId: number,
  apiKey: string,
  buyOrder: WyvernV2.Order,
  tokenId: string,
  contract: string
) {
  try {
    console.debug(buyOrder)
    const order = {
      exchange: buyOrder.params.exchange,
      maker: buyOrder.params.maker,
      taker: buyOrder.params.taker,
      makerRelayerFee: buyOrder.params.makerRelayerFee,
      takerRelayerFee: buyOrder.params.takerRelayerFee,
      makerProtocolFee: '0',
      takerProtocolFee: '0',
      makerReferrerFee: '0',
      feeMethod: 1,
      feeRecipient: buyOrder.params.feeRecipient,
      side: buyOrder.params.side,
      saleKind: buyOrder.params.saleKind,
      target: buyOrder.params.target,
      howToCall: buyOrder.params.howToCall,
      calldata: buyOrder.params.calldata,
      replacementPattern: buyOrder.params.replacementPattern,
      staticTarget: buyOrder.params.staticTarget,
      staticExtradata: buyOrder.params.staticExtradata,
      paymentToken: buyOrder.params.paymentToken,
      quantity: '1',
      basePrice: buyOrder.params.basePrice,
      extra: buyOrder.params.extra,
      listingTime: buyOrder.params.listingTime,
      // Adjust time format for OpenSea
      expirationTime: +buyOrder.params.expirationTime.toString().slice(0, -3),
      salt: buyOrder.params.salt,
      metadata: {
        asset: {
          id: tokenId,
          address: contract,
        },
        schema: 'ERC721',
      },
      v: buyOrder.params.v,
      r: buyOrder.params.r,
      s: buyOrder.params.s,
      hash: buyOrder.hash(),
    }

    // Post buy order to OpenSea
    const res = await fetch(
      `https://${
        chainId === 4 ? 'testnets-api.' : ''
      }opensea.io/wyvern/v1/orders/post`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify(order),
      }
    )

    const json = await res.json()

    return json
  } catch (err) {
    console.error('Could not post buy order to OpenSea')
    return null
  }
}

/**
 * Make an offer
 * @param chainId
 * @param provider
 * @param input
 * @param apiBase
 * @param apiKey
 * @param signer
 * @param query
 * @param postOnOpenSea
 */
async function makeOffer(
  chainId: number,
  provider: Provider,
  input: BigNumber,
  apiBase: string,
  apiKey: string,
  signer: Signer,
  query: paths['/orders/build']['get']['parameters']['query'],
  postOnOpenSea: boolean,
  missingWeth: BigNumber
) {
  try {
    // Get a wETH instance
    const weth = await getWeth(chainId, provider, signer)

    if (weth?.weth) {
      // Check the signer's allowance
      const isAllowanceOk = await hasWethAllowance(
        chainId,
        weth.weth,
        input,
        signer
      )

      if (isAllowanceOk) {
        const isBalanceOk = await checkUserBalance(
          signer,
          missingWeth,
          weth.weth
        )
        if (isBalanceOk) {
          const buyOrder = await postBuyOrder(chainId, apiBase, signer, query)

          if (buyOrder && postOnOpenSea && query?.contract && query?.tokenId) {
            await postBuyOrderToOpenSea(
              chainId,
              apiKey,
              buyOrder,
              query?.tokenId,
              query?.contract
            )
          }
        }
      }
    }
  } catch (error) {
    console.error('Could not make offer', error)
  }
}

export {
  makeOffer,
  getWeth,
  hasWethAllowance,
  postBuyOrder,
  postBuyOrderToOpenSea,
}
