import { Signer } from 'ethers'
import { paths } from 'interfaces/apiTypes'
import executeSteps, { Execute } from 'lib/executeSteps'
import setParams from 'lib/params'

type Data = {
  query:
    | {
        contract: string | undefined
        maker: string | undefined
        price: string | undefined
        tokenId: string | undefined
        expirationTime: string | undefined
      }
    | paths['/execute/list']['get']['parameters']['query']
  signer: Signer | undefined
  apiBase: string | undefined
  setSteps: React.Dispatch<React.SetStateAction<Execute['steps']>>
  handleError?: (err: any) => any
  handleSuccess?: () => any
}

/**
 * List a token for sale
 * @param data
 */
export default async function listToken(data: Data) {
  const { query, signer, apiBase, setSteps, handleSuccess, handleError } = data

  if (
    !query.contract ||
    !query.maker ||
    !query.expirationTime ||
    !query.price ||
    !query.tokenId ||
    !signer ||
    !apiBase
  ) {
    console.debug(data)
    throw new ReferenceError('Some data is missing')
  }

  try {
    // Construct an URL object for the `/execute/list` endpoint
    const url = new URL('/execute/list', apiBase)

    setParams(url, query)

    await executeSteps(url, signer, setSteps)

    if (handleSuccess) handleSuccess()
  } catch (err: any) {
    if (handleError) handleError(err)
    console.error(err)
  }
}
