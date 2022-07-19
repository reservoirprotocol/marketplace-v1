import { paths } from '@reservoir0x/reservoir-kit-core'
import React, { FC, useContext } from 'react'
import { SWRResponse } from 'swr'
import { useSigner } from 'wagmi'
import { GlobalContext } from 'context/GlobalState'
import { BuyModal } from '@reservoir0x/reservoir-kit-ui'
import { useSwitchNetwork } from 'wagmi'

const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID

type Details = paths['/tokens/details/v4']['get']['responses']['200']['schema']
type Collection = paths['/collection/v2']['get']['responses']['200']['schema']

type Props = {
  data: {
    details: SWRResponse<Details, any>
    collection: Collection | undefined
  }
  isInTheWrongNetwork: boolean | undefined
  signer: ReturnType<typeof useSigner>['data']
}

const BuyNow: FC<Props> = ({ data, isInTheWrongNetwork, signer }) => {
  const { dispatch } = useContext(GlobalContext)
  const { switchNetworkAsync } = useSwitchNetwork({
    chainId: CHAIN_ID ? +CHAIN_ID : undefined,
  })

  let forSale = false
  let tokenId: string | undefined
  let collectionId: string | undefined

  if ('details' in data && data.details.data?.tokens?.[0].token?.tokenId) {
    const token = data.details.data.tokens[0].token
    tokenId = token.tokenId
    collectionId = token.collection?.id
    forSale = data.details.data.tokens[0].market?.floorAsk?.price != null
  }

  const trigger = <button className="btn-primary-fill w-full">Buy Now</button>

  if (!forSale) {
    return null
  }

  const canBuy = signer && tokenId && !isInTheWrongNetwork

  return !canBuy ? (
    <button
      className="btn-primary-fill w-full"
      disabled={isInTheWrongNetwork && !switchNetworkAsync}
      onClick={async () => {
        if (isInTheWrongNetwork && switchNetworkAsync && CHAIN_ID) {
          const chain = await switchNetworkAsync?.(+CHAIN_ID)
          if (chain.id !== +CHAIN_ID) {
            return false
          }
        }

        if (signer && tokenId) {
          dispatch({ type: 'CONNECT_WALLET', payload: true })
        }
      }}
    >
      Buy Now
    </button>
  ) : (
    <BuyModal
      trigger={trigger}
      tokenId={tokenId}
      collectionId={collectionId}
      onComplete={() => {
        if ('details' in data && 'mutate' in data.details) {
          data.details.mutate()
        }
      }}
    />
  )
}

export default BuyNow
