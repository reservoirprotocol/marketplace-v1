import { Signer } from 'ethers'
import { paths } from 'interfaces/apiTypes'
import executeSteps, { Execute } from 'lib/executeSteps'
import setParams from 'lib/params'
import { pollSwr } from 'lib/pollApi'
import React, { FC, useState } from 'react'
import { SWRResponse } from 'swr'
import StepsModal from './StepsModal'

type Props = {
  isInTheWrongNetwork: boolean | undefined
  details: SWRResponse<
    paths['/tokens/details']['get']['responses']['200']['schema'],
    any
  >
  apiBase: string
  signer: Signer | undefined
}

const AcceptOffer: FC<Props> = ({
  isInTheWrongNetwork,
  details,
  apiBase,
  signer,
}) => {
  const [waitingTx, setWaitingTx] = useState<boolean>(false)
  const [steps, setSteps] = useState<Execute['steps']>()

  const token = details.data?.tokens?.[0]
  return (
    <>
      <StepsModal steps={steps} />
      <button
        disabled={
          waitingTx || !token?.market?.topBuy?.value || isInTheWrongNetwork
        }
        onClick={async () => {
          const tokenId = token?.token?.tokenId
          const contract = token?.token?.contract

          if (!tokenId || !contract || !signer) {
            console.debug({ tokenId, contract, signer })
            return
          }

          try {
            const url = new URL('/execute/sell', apiBase)

            const query: paths['/execute/sell']['get']['parameters']['query'] =
              {
                tokenId,
                contract,
                taker: await signer.getAddress(),
              }

            setParams(url, query)
            setWaitingTx(true)

            await executeSteps(url, signer, (execute) =>
              setSteps(execute.steps)
            )
            await pollSwr(details.data, details.mutate)
          } catch (err) {
            console.error(err)
          }

          setWaitingTx(false)
          setSteps(undefined)
        }}
        className="btn-neutral-outline w-full border-neutral-900"
      >
        {waitingTx ? 'Waiting...' : 'Accept Offer'}
      </button>
    </>
  )
}

export default AcceptOffer
