import { Signer } from 'ethers'
import { paths } from 'interfaces/apiTypes'
import executeSteps, { Execute } from 'lib/executeSteps'
import setParams from 'lib/params'

type Data = {
  tokenId: string | undefined
  contract: string | undefined
  signer: Signer | undefined
  apiBase: string | undefined
  setSteps: React.Dispatch<React.SetStateAction<Execute['steps']>>
  handleError?: (err: any) => any
  handleSuccess?: () => any
}

/**
 * Accept an offer to buy your token
 * @param data
 */
export default async function acceptOffer(data: Data) {
  const {
    tokenId,
    contract,
    signer,
    apiBase,
    setSteps,
    handleSuccess,
    handleError,
  } = data

  if (!tokenId || !contract || !signer || !apiBase) {
    console.debug(data)
    throw new ReferenceError('Some data is missing')
  }

  try {
    // Construct an URL object for the `/execute/sell` endpoint
    const url = new URL('/execute/sell', apiBase)

    // Construct the query object to execute the trade
    const query: paths['/execute/sell']['get']['parameters']['query'] = {
      tokenId,
      contract,
      taker: await signer.getAddress(),
    }

    setParams(url, query)

    await executeSteps(url, signer, setSteps)

    if (handleSuccess) handleSuccess()
  } catch (err: any) {
    if (handleError) handleError(err)
    console.error(err)
  }
}
