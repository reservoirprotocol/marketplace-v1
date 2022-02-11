import { Signer } from 'ethers'
import { paths } from 'interfaces/apiTypes'
import executeSteps from './executeSteps'
import setParams from './params'

export default async function cancelOrder(
  apiBase: string,
  signer: Signer,
  query: paths['/execute/cancel']['get']['parameters']['query']
) {
  const url = new URL('/execute/cancel', apiBase)

  setParams(url, query)

  await executeSteps(url, signer)
}
