import { Signer } from 'ethers'
import { paths } from 'interfaces/apiTypes'
import executeSteps from './executeSteps'
import setParams from './params'

export default async function instantBuy(
  apiBase: string,
  signer: Signer,
  query: paths['/execute/buy']['get']['parameters']['query']
) {
  const url = new URL('/execute/buy', apiBase)

  setParams(url, query)

  await executeSteps(url, signer)
}
