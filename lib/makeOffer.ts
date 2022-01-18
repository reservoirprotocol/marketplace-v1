import { Provider } from '@ethersproject/abstract-provider'
import { WyvernV2 } from '@reservoir0x/sdk'
import { Weth } from '@reservoir0x/sdk/dist/common/helpers'
import { BigNumber, ContractTransaction, Signer } from 'ethers'
import { paths } from 'interfaces/apiTypes'

async function getWeth(
  CHAIN_ID: number,
  provider: Provider,
  signerAddress: string
) {
  const weth = new Weth(provider, CHAIN_ID)
  const balance = BigNumber.from(await weth.getBalance(signerAddress))
  return { weth, balance }
}

export async function checkWethAllowance(
  CHAIN_ID: number,
  weth: Weth,
  input: BigNumber,
  provider: Provider,
  signer: Signer
) {
  let tokenTransferProxy =
    process.env.NEXT_PUBLIC_CHAIN_ID === '4'
      ? '0x82d102457854c985221249f86659c9d6cf12aa72'
      : '0xe5c783ee536cf5e63e792988335c4255169be4e1'

  let allowance = await weth.getAllowance(
    await signer.getAddress(),
    tokenTransferProxy
  )

  if (input.gt(allowance)) {
    // The exchange doesn't have enough allowance
    try {
      // Approve the exchange to spend the total supply of wETH
      let weth = new Weth(provider, CHAIN_ID)
      let tx = (await weth.approve(
        signer,
        tokenTransferProxy,
        '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
      )) as ContractTransaction

      await tx.wait()

      return true
    } catch (err) {
      console.error('Could not approve wETH')
      return false
    }
  } else {
    // The exchange has enough allowance
    return true
  }
}

export async function checkUserBalance(
  CHAIN_ID: number,
  provider: Provider,
  signer: Signer,
  missingWeth: BigNumber
) {
  if (missingWeth.isZero()) {
    // The user HAS enough wETH
    return true
  } else {
    try {
      let weth = new Weth(provider, CHAIN_ID)
      // Wrapped the necessary ETH
      let tx = (await weth.deposit(signer, missingWeth)) as ContractTransaction

      await tx.wait()

      return true
    } catch (err) {
      console.error('Could not deposit wETH')
      return false
    }
  }
}

export async function postBuyOrder(
  CHAIN_ID: number,
  API_BASE: string,
  orderUrl: string,
  signer: Signer
) {
  try {
    let res = await fetch(orderUrl)

    let { order } =
      (await res.json()) as paths['/orders/build']['get']['responses']['200']['schema']

    if (!order?.params) {
      throw 'There was an error fetching the order from the API'
    }

    const buyOrder = new WyvernV2.Order(CHAIN_ID, order.params)

    await buyOrder.sign(signer)

    let url2 = new URL('/orders', API_BASE)

    await fetch(url2.href, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orders: [{ kind: 'wyvern-v2', data: buyOrder.params }],
      }),
    })

    return true
  } catch (err) {
    console.error('Could not place the bid')
    return false
  }
}

export async function postBuyOrderToOpenSea(
  CHAIN_ID: number,
  API_KEY: string,
  orderParams: WyvernV2.Types.OrderParams,
  signer: Signer,
  tokenId: string,
  contract: string
) {
  try {
    const buyOrder = new WyvernV2.Order(CHAIN_ID, orderParams)

    await buyOrder.sign(signer)

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
      expirationTime: buyOrder.params.expirationTime,
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

    await fetch(
      `https://${
        CHAIN_ID === 4 ? 'testnets-api.' : ''
      }opensea.io/wyvern/v1/orders/post`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
        },
        body: JSON.stringify(order),
      }
    )

    return true
  } catch (err) {
    console.error('Could not place the bid')
    return false
  }
}

function makeOffer() {}

export { makeOffer }
