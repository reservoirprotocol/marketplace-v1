import BuyNow from 'components/BuyNow'
import CancelListing from 'components/CancelListing'
import CancelOffer from 'components/CancelOffer'
import {
  ListModal,
  BidModal,
  useReservoirClient,
  AcceptBidModal,
  useTokens,
} from '@reservoir0x/reservoir-kit-ui'
import React, { ComponentPropsWithoutRef, FC, ReactNode, useState } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import { useAccount, useNetwork, useSigner } from 'wagmi'
import { setToast } from './setToast'
import recoilCartTokens, {
  getCartCurrency,
  getPricingPools,
  getTokensMap,
} from 'recoil/cart'
import FormatCrypto from 'components/FormatCrypto'
import { Collection } from 'types/reservoir'
import { formatDollar } from 'lib/numbers'
import useCoinConversion from 'hooks/useCoinConversion'
import SwapCartModal from 'components/SwapCartModal'
import { FaShoppingCart } from 'react-icons/fa'
import ConnectWalletButton from 'components/ConnectWalletButton'
import useMounted from 'hooks/useMounted'
import { useRouter } from 'next/router'
import { getPricing } from 'lib/token/pricing'

const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID
const SOURCE_ID = process.env.NEXT_PUBLIC_SOURCE_ID
const SOURCE_ICON = process.env.NEXT_PUBLIC_SOURCE_ICON
const API_BASE =
  process.env.NEXT_PUBLIC_RESERVOIR_API_BASE || 'https://api.reservoir.tools'
const CURRENCIES = process.env.NEXT_PUBLIC_LISTING_CURRENCIES

type Props = {
  details: ReturnType<typeof useTokens>
  collection?: Collection
  isOwner: boolean
}

type ListingCurrencies = ComponentPropsWithoutRef<
  typeof ListModal
>['currencies']
let listingCurrencies: ListingCurrencies = undefined

if (CURRENCIES) {
  listingCurrencies = JSON.parse(CURRENCIES)
}

const PriceData: FC<Props> = ({ details, collection, isOwner }) => {
  const router = useRouter()
  const isMounted = useMounted()
  const [cartTokens, setCartTokens] = useRecoilState(recoilCartTokens)
  const tokensMap = useRecoilValue(getTokensMap)
  const cartCurrency = useRecoilValue(getCartCurrency)
  const cartPools = useRecoilValue(getPricingPools)
  const accountData = useAccount()
  const { data: signer } = useSigner()
  const { chain: activeChain } = useNetwork()
  const reservoirClient = useReservoirClient()
  const [clearCartOpen, setClearCartOpen] = useState(false)
  const [cartToSwap, setCartToSwap] = useState<undefined | typeof cartTokens>()
  const account = useAccount()
  const bidOpenState = useState(true)

  const queryBidId = router.query.bidId as string
  const deeplinkToAcceptBid = router.query.acceptBid === 'true'

  const token = details.data ? details.data[0] : undefined
  const tokenId = token?.token?.tokenId
  const contract = token?.token?.contract

  let floorAskPrice = getPricing(cartPools, token)
  let canAddToCart = true

  if (!floorAskPrice && token?.market?.floorAsk?.dynamicPricing?.data?.pool) {
    canAddToCart = false
  }

  // Disabling the rules of hooks here due to erroneous error message,
  //  the linter is likely confused due to two custom hook calls of the same name
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const topBidUsdConversion = useCoinConversion(
    token?.market?.topBid?.price?.currency?.symbol ? 'usd' : undefined,
    token?.market?.topBid?.price?.currency?.symbol
  )

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const floorAskUsdConversion = useCoinConversion(
    floorAskPrice?.currency?.symbol ? 'usd' : undefined,
    floorAskPrice?.currency?.symbol
  )

  if (!isMounted) {
    return null
  }

  const topBidUsdPrice =
    topBidUsdConversion && token?.market?.topBid?.price?.amount?.decimal
      ? topBidUsdConversion * token?.market?.topBid?.price?.amount?.decimal
      : null

  const floorAskUsdPrice =
    floorAskUsdConversion && floorAskPrice?.amount?.decimal
      ? floorAskUsdConversion * floorAskPrice?.amount?.decimal
      : null

  const listSourceName = token?.market?.floorAsk?.source?.name as
    | string
    | undefined
  const listSourceDomain = token?.market?.floorAsk?.source?.domain as
    | string
    | undefined

  const offerSourceName = token?.market?.topBid?.source?.name as
    | string
    | undefined
  const offerSourceDomain = token?.market?.topBid?.source?.domain as
    | string
    | undefined

  let isLocalListed = false

  if (
    reservoirClient?.source &&
    listSourceDomain &&
    reservoirClient.source === listSourceDomain
  ) {
    isLocalListed = true
  } else if (SOURCE_ID && listSourceName && SOURCE_ID === listSourceName) {
    isLocalListed = true
  }

  const listSourceLogo =
    isLocalListed && SOURCE_ICON
      ? SOURCE_ICON
      : `${API_BASE}/redirect/sources/${
          listSourceDomain || listSourceName
        }/logo/v2`

  if (!CHAIN_ID) return null

  const isTopBidder =
    accountData.isConnected &&
    token?.market?.topBid?.maker?.toLowerCase() ===
      accountData?.address?.toLowerCase()
  const isListed = token
    ? floorAskPrice !== null && token?.token?.kind !== 'erc1155'
    : false
  const isInTheWrongNetwork = Boolean(signer && activeChain?.id !== +CHAIN_ID)

  const offerSourceLogo = `${API_BASE}/redirect/sources/${
    offerSourceDomain || offerSourceName
  }/logo/v2`

  const listSourceRedirect = `${API_BASE}/redirect/sources/${
    listSourceDomain || listSourceName
  }/tokens/${contract}:${tokenId}/link/v2`

  const offerSourceRedirect = `${API_BASE}/redirect/sources/${
    offerSourceDomain || offerSourceName
  }/tokens/${contract}:${tokenId}/link/v2`

  const isInCart = Boolean(tokensMap[`${contract}:${tokenId}`])

  const showAcceptOffer =
    token?.market?.topBid?.id !== null &&
    token?.market?.topBid?.id !== undefined &&
    isOwner
      ? true
      : false

  return (
    <div className="col-span-full md:col-span-4 lg:col-span-5 lg:col-start-2">
      <article className="col-span-full rounded-2xl border border-gray-300 bg-white p-6 dark:border-neutral-600 dark:bg-black">
        <div className="grid grid-cols-2 gap-6">
          <Price
            title="List Price"
            source={
              listSourceName && (
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={listSourceRedirect}
                  className="reservoir-body flex items-center gap-2 dark:text-white"
                >
                  on {listSourceName}
                  <img
                    className="h-6 w-6"
                    src={listSourceLogo}
                    alt="Source Logo"
                  />
                </a>
              )
            }
            price={
              <FormatCrypto
                amount={floorAskPrice?.amount?.decimal}
                address={floorAskPrice?.currency?.contract}
                decimals={floorAskPrice?.currency?.decimals}
                logoWidth={30}
                maximumFractionDigits={8}
              />
            }
            usdPrice={floorAskUsdPrice}
          />
          <Price
            title="Top Offer"
            source={
              offerSourceName && (
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={offerSourceRedirect}
                  className="reservoir-body flex items-center gap-2 dark:text-white"
                >
                  on {offerSourceName}
                  <img
                    className="h-6 w-6"
                    src={offerSourceLogo}
                    alt="Source Logo"
                  />
                </a>
              )
            }
            price={
              <FormatCrypto
                amount={token?.market?.topBid?.price?.amount?.decimal}
                address={token?.market?.topBid?.price?.currency?.contract}
                decimals={token?.market?.topBid?.price?.currency?.decimals}
                logoWidth={30}
                maximumFractionDigits={8}
              />
            }
            usdPrice={topBidUsdPrice}
          />
        </div>
        <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
          {account.isDisconnected ? (
            <ConnectWalletButton className="w-full">
              <span>Connect Wallet</span>
            </ConnectWalletButton>
          ) : (
            <>
              {isOwner && (
                <ListModal
                  trigger={
                    <button className="btn-primary-fill w-full dark:ring-primary-900 dark:focus:ring-4">
                      {floorAskPrice?.amount?.decimal
                        ? 'Create New Listing'
                        : 'List for Sale'}
                    </button>
                  }
                  collectionId={contract}
                  tokenId={tokenId}
                  currencies={listingCurrencies}
                  onListingComplete={() => {
                    details && details.mutate()
                  }}
                  onListingError={(err: any) => {
                    if (err?.code === 4001) {
                      setToast({
                        kind: 'error',
                        message: 'You have canceled the transaction.',
                        title: 'User canceled transaction',
                      })
                      return
                    }
                    setToast({
                      kind: 'error',
                      message: 'The transaction was not completed.',
                      title: 'Could not list token',
                    })
                  }}
                />
              )}
              {!isOwner && (
                <BuyNow
                  buttonClassName="btn-primary-fill col-span-1"
                  data={{
                    details: details,
                  }}
                  signer={signer}
                  isInTheWrongNetwork={isInTheWrongNetwork}
                  mutate={details.mutate}
                />
              )}
              <AcceptBidModal
                trigger={
                  showAcceptOffer ? (
                    <button
                      disabled={isInTheWrongNetwork}
                      className="btn-primary-outline w-full dark:text-white"
                    >
                      Accept Offer
                    </button>
                  ) : null
                }
                openState={
                  isOwner && (queryBidId || deeplinkToAcceptBid)
                    ? bidOpenState
                    : undefined
                }
                bidId={queryBidId}
                collectionId={collection?.id}
                tokenId={token?.token?.tokenId}
                onClose={() => details && details.mutate()}
                onBidAcceptError={(error: any) => {
                  if (error?.type === 'price mismatch') {
                    setToast({
                      kind: 'error',
                      message: 'Offer was lower than expected.',
                      title: 'Could not accept offer',
                    })
                    return
                  }
                  // Handle user rejection
                  if (error?.code === 4001) {
                    setToast({
                      kind: 'error',
                      message: 'You have canceled the transaction.',
                      title: 'User canceled transaction',
                    })
                    return
                  }
                  setToast({
                    kind: 'error',
                    message: 'The transaction was not completed.',
                    title: 'Could not accept offer',
                  })
                }}
              />

              {!isOwner && (
                <BidModal
                  collectionId={collection?.id}
                  tokenId={token?.token?.tokenId}
                  trigger={
                    <button
                      disabled={isInTheWrongNetwork}
                      className="btn-primary-outline w-full dark:border-neutral-600 dark:text-white dark:ring-primary-900 dark:focus:ring-4"
                    >
                      Make Offer
                    </button>
                  }
                  onBidComplete={() => {
                    details && details.mutate()
                  }}
                />
              )}

              <CancelOffer
                data={{
                  details,
                }}
                signer={signer}
                show={isTopBidder}
                isInTheWrongNetwork={isInTheWrongNetwork}
                setToast={setToast}
              />
              <CancelListing
                data={{
                  details,
                }}
                signer={signer}
                show={isOwner && isListed}
                isInTheWrongNetwork={isInTheWrongNetwork}
                setToast={setToast}
              />
            </>
          )}
        </div>
        {isInCart && !isOwner && (
          <button
            onClick={() => {
              const newCartTokens = [...cartTokens]
              const index = newCartTokens.findIndex(
                (cartToken) =>
                  cartToken?.token?.contract === contract &&
                  cartToken?.token?.tokenId === tokenId
              )
              newCartTokens.splice(index, 1)
              setCartTokens(newCartTokens)
            }}
            className="mt-4 w-fit text-left outline-none disabled:cursor-not-allowed  dark:border-neutral-600 dark:focus:ring-4  dark:focus:ring-primary-900"
          >
            <span>You can also</span>{' '}
            <span className="text-[#FF3B3B] dark:text-[#FF9A9A]">
              remove from cart
            </span>
          </button>
        )}

        {!isInCart && !isOwner && isListed && canAddToCart && (
          <button
            disabled={!floorAskPrice}
            onClick={() => {
              if (token?.token && token.market) {
                if (
                  !cartCurrency ||
                  floorAskPrice?.currency?.contract === cartCurrency?.contract
                ) {
                  setCartTokens([
                    ...cartTokens,
                    {
                      token: token.token,
                      market: token.market,
                    },
                  ])
                } else {
                  setCartToSwap([
                    {
                      token: token.token,
                      market: token.market,
                    },
                  ])
                  setClearCartOpen(true)
                }
              }
            }}
            className="mt-4 w-fit outline-none dark:focus:ring-4 dark:focus:ring-primary-900"
          >
            <div className="flex items-center dark:text-white">
              <div>
                <span>You can also</span>{' '}
                <span className="text-primary-700 dark:text-primary-100">
                  add to cart
                </span>
              </div>

              <FaShoppingCart className="ml-[10px] h-[18px] w-[18px] text-primary-700 dark:text-primary-100" />
            </div>
          </button>
        )}
      </article>
      <SwapCartModal
        open={clearCartOpen}
        setOpen={setClearCartOpen}
        cart={cartToSwap}
      />
    </div>
  )
}

export default PriceData

const Price: FC<{
  title: string
  price: ReactNode
  source?: ReactNode
  usdPrice: number | null
}> = ({ title, price, usdPrice, source }) => (
  <div className="flex flex-col space-y-5">
    <div className="flex-grow">
      <div className="reservoir-h5 font-headings dark:text-white">{title}</div>
      {source}
    </div>
    <div className="reservoir-h3 font-headings dark:text-white">
      {price}
      <div className="text-sm text-neutral-600 dark:text-neutral-300">
        {formatDollar(usdPrice)}
      </div>
    </div>
  </div>
)
