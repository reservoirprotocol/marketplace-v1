import { Signer } from 'ethers'
import { paths } from 'interfaces/apiTypes'
import executeSteps, { Execute } from 'lib/executeSteps'
import setParams from 'lib/params'

type Data = {
  query: paths['/execute/bid']['get']['parameters']['query']
  signer: Signer | undefined
  apiBase: string | undefined
  setSteps: React.Dispatch<React.SetStateAction<Execute['steps']>>
  handleError?: (err: any) => any
  handleSuccess?: () => any
}

/**
 * Place an offer to buy a token
 * @param data
 */
export default async function placeBid(data: Data) {
  const { query, signer, apiBase, setSteps, handleSuccess, handleError } = data

  if (!signer || !apiBase) {
    console.debug(data)
    throw new ReferenceError('Some data is missing')
  }

  try {
    // Construct an URL object for the `/execute/bid` endpoint
    const url = new URL('/execute/bid', apiBase)

    setParams(url, query)

    await executeSteps(url, signer, setSteps)

    if (handleSuccess) handleSuccess()
  } catch (err: any) {
    if (handleError) handleError(err)
    console.error(err)
  }
}
