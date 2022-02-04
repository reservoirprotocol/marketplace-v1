import { Signer } from 'ethers'
import { paths } from 'interfaces/apiTypes'
import { instantBuy } from 'lib/buyToken'
import longPoll from 'lib/pollApi'
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

const BuyNow: FC<Props> = ({
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

        const query: paths['/orders/fill']['get']['parameters']['query'] = {
          contract,
          tokenId,
          side: 'sell',
        }

        try {
          setWaitingTx(true)
          await instantBuy(apiBase, +chainId as ChainId, signer, query)
          await longPoll(details.data, details.mutate)
          setWaitingTx(false)
        } catch (error) {
          setWaitingTx(false)
          console.error(error)
          return
        }
      }}
      className="btn-neutral-fill-dark w-full"
    >
      {waitingTx ? 'Waiting...' : 'Buy Now'}
    </button>
  )
}

export default BuyNow
