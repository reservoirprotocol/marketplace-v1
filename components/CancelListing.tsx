import { Signer } from 'ethers'
import { paths } from 'interfaces/apiTypes'
import cancelOrder from 'lib/cancelOrder'
import { pollSwr } from 'lib/pollApi'
import React, { FC, useState } from 'react'
import { SWRResponse } from 'swr'

type Props = {
  isInTheWrongNetwork: boolean | undefined
  details: SWRResponse<
    paths['/tokens/details']['get']['responses']['200']['schema'],
    any
  >
  apiBase: string
  chainId: string
  signer: Signer | undefined
}

const CancelListing: FC<Props> = ({
  isInTheWrongNetwork,
  details,
  apiBase,
  chainId,
  signer,
}) => {
  const [waitingTx, setWaitingTx] = useState<boolean>(false)

  const token = details.data?.tokens?.[0]
  return (
    <button
      disabled={waitingTx || isInTheWrongNetwork}
      onClick={async () => {
        const tokenId = token?.token?.tokenId
        const contract = token?.token?.contract

        if (!signer || !tokenId || !contract) {
          console.debug({ tokenId, signer, contract })
          return
        }

        const query: Parameters<typeof cancelOrder>[3] = {
          contract,
          tokenId,
          side: 'sell',
        }

        try {
          setWaitingTx(true)
          await cancelOrder(apiBase, +chainId as ChainId, signer, query)
          await pollSwr(details.data, details.mutate)
          setWaitingTx(false)
        } catch (error) {
          setWaitingTx(false)
          console.error(error)
        }
      }}
      className="btn-red-ghost col-span-2 mx-auto mt-8"
    >
      {waitingTx ? 'Waiting...' : 'Cancel listing'}
    </button>
  )
}

export default CancelListing
