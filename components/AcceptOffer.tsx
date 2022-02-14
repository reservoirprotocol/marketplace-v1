import { Signer } from 'ethers'
import { paths } from 'interfaces/apiTypes'
import acceptOffer from 'lib/acceptOffer'
import { Execute } from 'lib/executeSteps'
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
            const query: Parameters<typeof acceptOffer>[2] = {
              tokenId,
              contract,
              taker: await signer.getAddress(),
            }

            setWaitingTx(true)
            await acceptOffer(apiBase, signer, query, setSteps)
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
