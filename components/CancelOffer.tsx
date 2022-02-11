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

const CancelOffer: FC<Props> = ({
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
        const hash = token?.market?.topBuy?.hash
        const maker = token?.market?.topBuy?.maker

        if (!signer || !hash || !maker) {
          console.debug({ hash, signer, maker })
          return
        }

        const query: Parameters<typeof cancelOrder>[2] = {
          maker,
          hash,
        }

        try {
          setWaitingTx(true)
          await cancelOrder(apiBase, signer, query)
          await pollSwr(details.data, details.mutate)
          setWaitingTx(false)
        } catch (err) {
          console.error(err)
          setWaitingTx(false)
        }
      }}
      className="btn-red-ghost col-span-2 mx-auto mt-6"
    >
      {waitingTx ? 'Waiting...' : 'Cancel your offer'}
    </button>
  )
}

export default CancelOffer
