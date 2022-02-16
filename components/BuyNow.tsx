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
  setError: React.Dispatch<React.SetStateAction<boolean>>
}

const BuyNow: FC<Props> = ({
  isInTheWrongNetwork,
  details,
  apiBase,
  data,
  signer,
  setError,
}) => {
  const [waitingTx, setWaitingTx] = useState<boolean>(false)
  const [steps, setSteps] = useState<Execute['steps']>()
  const token = details.data?.tokens?.[0]
  return (
    <>
      <StepsModal title="Buy now" data={data} steps={steps} />
      <button
        disabled={
          !signer ||
          token?.market?.floorSell?.value === null ||
          waitingTx ||
          isInTheWrongNetwork
        }
        onClick={async () => {
          const tokenId = token?.token?.tokenId
          const contract = token?.token?.contract

          if (!signer || !tokenId || !contract) {
            console.debug({ tokenId, signer, contract })
            return
          }

          try {
            const url = new URL('/execute/buy', apiBase)

            const query: paths['/execute/buy']['get']['parameters']['query'] = {
              contract,
              tokenId,
              taker: await signer.getAddress(),
            }
            setParams(url, query)
            setWaitingTx(true)
            await executeSteps(url, signer, setSteps)
            details.mutate()
          } catch (err: any) {
            console.error(err)
            if (err?.message === 'Not enough ETH balance') setError(true)
          }
          setWaitingTx(false)
          setSteps(undefined)
        }}
        className="btn-neutral-fill-dark w-full"
      >
        {waitingTx ? 'Waiting...' : 'Buy Now'}
      </button>
    </>
  )
}

export default BuyNow
