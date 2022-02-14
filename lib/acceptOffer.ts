import { Signer } from 'ethers'
import { paths } from 'interfaces/apiTypes'
import setParams from './params'
import executeSteps, { Execute } from './executeSteps'
import { Dispatch, SetStateAction } from 'react'

export default async function acceptOffer(
  apiBase: string,
  signer: Signer,
  query: paths['/execute/sell']['get']['parameters']['query'],
  setSteps: Dispatch<SetStateAction<Execute['steps']>>
) {
  const url = new URL('/execute/sell', apiBase)

  setParams(url, query)

  await executeSteps(url, signer, (execute) => setSteps(execute.steps))
}
