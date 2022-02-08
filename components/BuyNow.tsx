import { Signer } from 'ethers'
import { paths } from 'interfaces/apiTypes'
import instantBuy from 'lib/buyToken'
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

        try {
          const query: Parameters<typeof instantBuy>[2] = {
            contract,
            tokenId,
            side: 'sell',
            taker: await signer.getAddress(),
          }
          setWaitingTx(true)
          await instantBuy(apiBase, signer, query)
          await pollSwr(details.data, details.mutate)
          setWaitingTx(false)
        } catch (err) {
          console.error(err)
          setWaitingTx(false)
        }
      }}
      className="btn-neutral-fill-dark w-full"
    >
      {waitingTx ? 'Waiting...' : 'Buy Now'}
    </button>
  )
}

export default BuyNow
