import { Signer } from 'ethers'
import { paths } from 'interfaces/apiTypes'
import setParams from './params'
import executeSteps from './executeSteps'

export default async function acceptOffer(
  apiBase: string,
  signer: Signer,
  query: paths['/execute/sell']['get']['parameters']['query']
) {
  const url = new URL('/execute/sell', apiBase)

  setParams(url, query)

  await executeSteps(url, signer)
}
