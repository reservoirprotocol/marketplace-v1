import { Signer } from 'ethers'
import { arrayify, splitSignature } from 'ethers/lib/utils'
import { paths } from 'interfaces/apiTypes'
import checkCompleteness from './checkCompleteness'
import setParams from './params'

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
