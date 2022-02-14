import { Signer } from 'ethers'
import { paths } from 'interfaces/apiTypes'
import { Dispatch, SetStateAction } from 'react'
import executeSteps, { Execute } from './executeSteps'
import getOrderSignature from './getOrderSignature'
import setParams from './params'

export default async function listTokenForSale(
  apiBase: string,
  signer: Signer,
  query: paths['/execute/list']['get']['parameters']['query'],
  setSteps: Dispatch<SetStateAction<Execute['steps']>>
) {
  const url = new URL('/execute/list', apiBase)

  setParams(url, query)

  await executeSteps(url, signer, (execute) => setSteps(execute.steps))
}
