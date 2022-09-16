import { paths } from '@reservoir0x/reservoir-kit-client'
import React, { FC, useContext } from 'react'
import { SWRResponse } from 'swr'
import { useSigner } from 'wagmi'
import { GlobalContext } from 'context/GlobalState'
import { BuyModal, useTokens } from '@reservoir0x/reservoir-kit-ui'
import { useSwitchNetwork } from 'wagmi'

const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID

type Props = {
  data: {
    details?: ReturnType<typeof useTokens>
    token?: ReturnType<typeof useTokens>['data'][0]
  }
  isInTheWrongNetwork: boolean | undefined
  signer: ReturnType<typeof useSigner>['data']
  buttonClassName?: string
  mutate?: SWRResponse['mutate']
}

const BuyNow: FC<Props> = ({
  data,
  isInTheWrongNetwork,
  signer,
  buttonClassName = 'btn-primary-fill w-full',
  mutate,
}) => {
  const { dispatch } = useContext(GlobalContext)
  const { switchNetworkAsync } = useSwitchNetwork({
    chainId: CHAIN_ID ? +CHAIN_ID : undefined,
  })

  let forSale = false
  let tokenId: string | undefined
  let collectionId: string | undefined
  data.details?.data[0]?.token?.tokenId
  if ('details' in data && data.details?.data[0]?.token?.tokenId) {
    const token = data.details.data[0].token
    tokenId = token.tokenId
    collectionId = token.collection?.id
    forSale = data.details?.data[0]?.market?.floorAsk?.price != null
  } else if (data.token) {
    const token = data.token.token
    const marketData = data.token.market
    tokenId = token?.tokenId
    collectionId = token?.collection?.id
    forSale =
      marketData?.floorAsk?.price?.amount != null &&
      marketData?.floorAsk?.price?.amount != undefined
  }

  const trigger = <button className={buttonClassName}>Buy Now</button>

  if (!forSale) {
    return null
  }

  const canBuy = signer && tokenId && !isInTheWrongNetwork

  return !canBuy ? (
    <button
      className={buttonClassName}
      disabled={isInTheWrongNetwork && !switchNetworkAsync}
      onClick={async () => {
        if (isInTheWrongNetwork && switchNetworkAsync && CHAIN_ID) {
          const chain = await switchNetworkAsync(+CHAIN_ID)
          if (chain.id !== +CHAIN_ID) {
            return false
          }
        }

        if (!signer) {
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
      onClose={() => {
        if (mutate) {
          mutate()
        }
      }}
    />
  )
}

export default BuyNow
