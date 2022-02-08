import { Signer } from 'ethers'
import { paths } from 'interfaces/apiTypes'
import checkCompleteness from './checkCompleteness'
import setParams from './params'

export default async function cancelOrder(
  apiBase: string,
  signer: Signer,
  query: paths['/execute/cancel']['get']['parameters']['query']
) {
  const url = new URL('/execute/cancel', apiBase)

  setParams(url, query)

  await checkCompleteness(url, signer)
}
