import { Signer } from 'ethers'
import { arrayify, splitSignature } from 'ethers/lib/utils'
import { paths } from 'interfaces/apiTypes'
import executeSteps from './executeSteps'
import setParams from './params'

export default async function listTokenForSale(
  apiBase: string,
  signer: Signer,
  query: paths['/execute/list']['get']['parameters']['query']
) {
  const url = new URL('/execute/list', apiBase)

  setParams(url, query)

  const data = await executeSteps(url, signer)

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
