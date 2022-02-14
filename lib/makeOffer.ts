import { BigNumber, Signer } from 'ethers'
import { randomBytes } from 'ethers/lib/utils'
import { paths } from 'interfaces/apiTypes'
import executeSteps, { Execute } from './executeSteps'
import setParams from './params'
import { WyvernV2 } from '@reservoir0x/sdk'
import getOrderSignature from './getOrderSignature'
import { Dispatch, SetStateAction } from 'react'

async function makeOffer(
  apiBase: string,
  signer: Signer,
  query: paths['/execute/bid']['get']['parameters']['query'],
  setSteps: Dispatch<SetStateAction<Execute['steps']>>
) {
  const url = new URL('/execute/bid', apiBase)

  setParams(url, query)

  await executeSteps(url, signer, (execute) => setSteps(execute.steps))

  // Post order to the database
  let url2 = new URL('/orders', apiBase)

  let orders: NonNullable<
    NonNullable<
      paths['/orders']['post']['parameters']['body']['body']
    >['orders']
  > = [
    {
      kind: 'wyvern-v2',
      // data: data.order.data,
      // signature: { r, s, v },
    },
  ]

  // Add data for attribute wide offers
  if (
    typeof query.collection === 'string' &&
    typeof query.attributeKey === 'string' &&
    typeof query.attributeValue === 'string'
  ) {
    orders[0]['attribute'] = {
      collection: query.collection,
      key: query.attributeKey,
      value: query.attributeValue,
    }
  }

  await fetch(url2.href, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ orders }),
  })

  // return data.order.data
}

/**
 * Post a buy order to OpenSea
 * @param chainId The Ethereum chain ID (eg: 1 - Ethereum Mainnet,
 *  4 - Rinkeby Testnet)
 * @param openSeaApiKey The OpenSea API key
 * @param orderParams The WyvernV2 order parameters
 * @param signer An Ethereum signer object
 * @param tokenId The token ID
 * @param contract The contract address for the token
 * @returns The response from the OpenSea API or `null` if
 * there was a failure posting the order
 */
async function postBuyOrderToOpenSea(
  chainId: ChainId,
  openSeaApiKey: string | undefined,
  params: WyvernV2.Types.OrderParams,
  tokenId: string,
  contract: string,
  signer: Signer
) {
  try {
    if (!openSeaApiKey) throw new ReferenceError('OpenSea API key is undefined')
    // Instatiate a Wyvern order
    const buyOrder = new WyvernV2.Order(chainId, {
      ...params,
      takerRelayerFee: params.takerRelayerFee + 250,
      // The fee recipient on the maker's order should never be the zero address.
      // Even if the fee is 0, the fee recipient should be set to the maker's address.
      feeRecipient: '0x5b3256965e7c3cf26e11fcaf296dfc8807c01073',
      // Set listing time 2 minutes in the past to make sure on-chain validation passes
      listingTime: Math.floor(Date.now() / 1000) - 120,
      salt: BigNumber.from(randomBytes(32)).toString(),
    })

    // Sign the order before posting to Reservoir
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

    // Post buy order to OpenSea
    const res = await fetch(
      `https://${
        chainId === 4 ? 'testnets-api.' : ''
      }opensea.io/wyvern/v1/orders/post`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': openSeaApiKey,
        },
        body: JSON.stringify(order),
      }
    )

    const json = await res.json()

    return json
  } catch (err) {
    console.error(err)
  }

  return null
}

export { makeOffer, postBuyOrderToOpenSea }
