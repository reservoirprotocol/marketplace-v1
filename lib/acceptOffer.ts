import { Signer } from 'ethers'
import { paths } from 'interfaces/apiTypes'
import setParams from './params'
import checkCompleteness from './checkCompleteness'

export default async function acceptOffer(
  apiBase: string,
  signer: Signer,
  query: paths['/execute/fill']['get']['parameters']['query']
) {
  const url = new URL('/execute/fill', apiBase)

  setParams(url, query)

  await checkCompleteness(url, signer)
}
