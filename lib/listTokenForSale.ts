import { Signer } from 'ethers'
import { arrayify, solidityKeccak256, splitSignature } from 'ethers/lib/utils'
import { paths } from 'interfaces/apiTypes'
import checkCompleteness from './checkCompleteness'
import setParams from './params'

const RAW_ORDER_FIELDS = [
  'address', // exchange
  'address', // maker
  'address', // taker
  'uint256', // makerRelayerFee
  'uint256', // takerRelayerFee
  'uint256', // makerProtocolFee (always 0)
  'uint256', // takerProtocolFee (always 0)
  'address', // feeRecipient
  'uint8', // feeMethod (always 1)
  'uint8', // side
  'uint8', // saleKind
  'address', // target
  'uint8', // howToCall
  'bytes', // calldata
  'bytes', // replacementPattern
  'address', // staticTarget
  'bytes', // staticExtradata
  'address', // paymentToken
  'uint256', // basePrice
  'uint256', // extra
  'uint256', // listingTime
  'uint256', // expirationTime
  'uint256', // salt
]

const toRaw = (order: any): any[] => [
  order.exchange,
  order.maker,
  order.taker,
  order.makerRelayerFee,
  order.takerRelayerFee,
  0, // makerProtocolFee (always 0)
  0, // takerProtocolFee (always 0)
  order.feeRecipient,
  1, // feeMethod (always 1 - SplitFee)
  order.side,
  order.saleKind,
  order.target,
  order.howToCall,
  order.calldata,
  order.replacementPattern,
  order.staticTarget,
  order.staticExtradata,
  order.paymentToken,
  order.basePrice,
  order.extra,
  order.listingTime,
  order.expirationTime,
  order.salt,
]

export default async function listTokenForSale(
  apiBase: string,
  signer: Signer,
  query: paths['/execute/build']['get']['parameters']['query']
) {
  const url = new URL('/execute/build', apiBase)

  setParams(url, query)

  const data = await checkCompleteness(url, signer)

  const signature = await signer.signMessage(arrayify(data.message.value))

  const { r, s, v } = splitSignature(signature)

  // Post order to the database
  let url2 = new URL('/orders', apiBase)

  await fetch(url2.href, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      orders: [
        {
          kind: 'wyvern-v2',
          data: data.order.data,
          signature: { r, s, v },
        },
      ],
    }),
  })
}
