import { Signer } from 'ethers'
import { paths } from 'interfaces/apiTypes'
import executeSteps, { Execute } from 'lib/executeSteps'
import setParams from 'lib/params'

type Data = {
  hash: string | undefined
  maker: string | undefined
  signer: Signer | undefined
  apiBase: string | undefined
  setSteps: React.Dispatch<React.SetStateAction<Execute['steps']>>
  handleUserRejection?: () => any
  handleError?: () => any
  handleSuccess?: () => any
}

/**
 * Cancel an offer or lisitng
 * @param data
 */
export default async function cancelOrder(data: Data) {
  const {
    hash,
    maker,
    signer,
    apiBase,
    setSteps,
    handleUserRejection,
    handleSuccess,
    handleError,
  } = data

  if (!hash || !maker || !signer || !apiBase) {
    console.debug(data)
    throw new ReferenceError('Some data is missing')
  }

  try {
    const url = new URL('/execute/cancel', apiBase)

    const query: paths['/execute/cancel']['get']['parameters']['query'] = {
      hash,
      maker,
    }

    setParams(url, query)

    await executeSteps(url, signer, setSteps)

    if (handleSuccess) handleSuccess()
  } catch (err: any) {
    // Handle user rejection
    if (err?.code === 4001) {
      // close modal
      if (handleUserRejection) handleUserRejection()
    }
    if (handleError) handleError()
    console.error(err)
  }
}
