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
    const url = new URL('/execute/sell', apiBase)

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
