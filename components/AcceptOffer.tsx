import { Signer } from 'ethers'
import { paths } from 'interfaces/apiTypes'
import executeSteps, { Execute } from 'lib/executeSteps'
import setParams from 'lib/params'
import React, { ComponentProps, FC, useState } from 'react'
import { SWRResponse } from 'swr'
import StepsModal from './StepsModal'

type Props = {
  isInTheWrongNetwork: boolean | undefined
  details: SWRResponse<
    paths['/tokens/details']['get']['responses']['200']['schema'],
    any
  >
  data: ComponentProps<typeof StepsModal>['data']
  apiBase: string
  signer: Signer | undefined
}

const AcceptOffer: FC<Props> = ({
  isInTheWrongNetwork,
  details,
  apiBase,
  data,
  signer,
}) => {
  const [waitingTx, setWaitingTx] = useState<boolean>(false)
  const [steps, setSteps] = useState<Execute['steps']>()

  const token = details.data?.tokens?.[0]
  return (
    <>
      <StepsModal title="Accept offer" data={data} steps={steps} />
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

            await executeSteps(url, signer, setSteps)
            details.mutate()
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
