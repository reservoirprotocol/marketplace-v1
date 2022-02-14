import { Signer } from 'ethers'
import { paths } from 'interfaces/apiTypes'
import instantBuy from 'lib/buyToken'
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
  setError: React.Dispatch<React.SetStateAction<boolean>>
}

const BuyNow: FC<Props> = ({
  isInTheWrongNetwork,
  details,
  apiBase,
  signer,
  setError,
}) => {
  const [waitingTx, setWaitingTx] = useState<boolean>(false)
  const [steps, setSteps] = useState<Execute['steps']>()
  const token = details.data?.tokens?.[0]
  return (
    <>
      <StepsModal steps={steps} />
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
            const query: Parameters<typeof instantBuy>[2] = {
              contract,
              tokenId,
              taker: await signer.getAddress(),
            }
            setWaitingTx(true)
            await instantBuy(apiBase, signer, query, setSteps)
            await pollSwr(details.data, details.mutate)
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
