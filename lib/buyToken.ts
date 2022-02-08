import { Signer } from 'ethers'
import { paths } from 'interfaces/apiTypes'
import checkCompleteness from './checkCompleteness'
import setParams from './params'

export default async function instantBuy(
  apiBase: string,
  signer: Signer,
  query: paths['/execute/fill']['get']['parameters']['query']
) {
  const url = new URL('/execute/fill', apiBase)

  setParams(url, query)

  await checkCompleteness(url, signer)
}
