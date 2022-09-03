import { paths } from '@reservoir0x/reservoir-kit-client'
import React, { FC, useContext } from 'react'
import { SWRResponse } from 'swr'
import { useSigner } from 'wagmi'
import { GlobalContext } from 'context/GlobalState'
import { BuyModal } from '@reservoir0x/reservoir-kit-ui'
import { useSwitchNetwork } from 'wagmi'
import WinterCheckout from './WinterCheckout'

const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID

type Details = paths['/tokens/details/v4']['get']['responses']['200']['schema']
type Collection = paths['/collection/v3']['get']['responses']['200']['schema']

type Props = {
  data: {
    details?: SWRResponse<Details, any>
    collection?: Collection
    token?: NonNullable<
      paths['/tokens/v4']['get']['responses']['200']['schema']['tokens']
    >[0]
  }
  isInTheWrongNetwork: boolean | undefined
  signer: ReturnType<typeof useSigner>['data']
  buttonClassName?: string
  mutate?: SWRResponse['mutate']
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

const BuyNow: FC<Props> = ({
  data,
  isInTheWrongNetwork,
  signer,
  buttonClassName = 'btn-primary-fill w-full',
  mutate,
  onClick,
}) => {
  const { dispatch } = useContext(GlobalContext)
  const { switchNetworkAsync } = useSwitchNetwork({
    chainId: CHAIN_ID ? +CHAIN_ID : undefined,
  })

  let forSale = false
  let tokenId: string | undefined
  let collectionId: string | undefined

  if ('details' in data && data?.details?.data?.tokens?.[0].token?.tokenId) {
    const token = data.details.data.tokens[0].token
    tokenId = token.tokenId
    collectionId = token.collection?.id
    forSale = data.details.data.tokens[0].market?.floorAsk?.price != null
  } else if (data.token) {
    tokenId = data.token.tokenId
    collectionId = data.token.collection?.id
    forSale =
      data.token.floorAskPrice != null && data.token.floorAskPrice != undefined
  }
  console.log('HELLO BUY NOW CLICKED4')
  const trigger = <button className={buttonClassName}>Buy Now POOOP</button>

  if (!forSale) {
    return null
  }

  const canBuy = signer && tokenId && !isInTheWrongNetwork

  return !canBuy ? (
    <button
      className={buttonClassName}
      disabled={isInTheWrongNetwork && !switchNetworkAsync}
      onClick={onClick}
    >
      Buy Now
    </button>
  ) : (
    <button
      className={buttonClassName}
      disabled={isInTheWrongNetwork && !switchNetworkAsync}
      onClick={onClick}
    >
      Buy Now
    </button>
  )
}

export default BuyNow
