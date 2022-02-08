import { Signer } from 'ethers'
import { paths } from 'interfaces/apiTypes'
import acceptOffer from 'lib/acceptOffer'
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

const AcceptOffer: FC<Props> = ({
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
            side: 'buy',
            taker: await signer.getAddress(),
          }

          setWaitingTx(true)
          await acceptOffer(apiBase, signer, query)
          await pollSwr(details.data, details.mutate)
          setWaitingTx(false)
        } catch (error) {
          setWaitingTx(false)
          console.error(error)
        }
      }}
      className="btn-neutral-outline w-full border-neutral-900"
    >
      {waitingTx ? 'Waiting...' : 'Accept Offer'}
    </button>
  )
}

export default AcceptOffer
