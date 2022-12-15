import Link from 'next/link'
import { optimizeImage } from 'lib/optmizeImage'
import Image from 'next/image'
import { FaShoppingCart } from 'react-icons/fa'
import React, {
  ComponentPropsWithoutRef,
  Dispatch,
  FC,
  SetStateAction,
} from 'react'
import FormatCrypto from 'components/FormatCrypto'
import BuyNow from 'components/BuyNow'
import useTokens from 'hooks/useTokens'
import { useRecoilState, useRecoilValue } from 'recoil'
import { getCartCurrency, getTokensMap } from 'recoil/cart'
import { useAccount, useNetwork, useSigner } from 'wagmi'
import recoilCartTokens, { getPricingPools } from 'recoil/cart'
import { ListModal, useReservoirClient } from '@reservoir0x/reservoir-kit-ui'
import { setToast } from './token/setToast'
import { MutatorCallback } from 'swr'
import { useMediaQuery } from '@react-hookz/web'
import RarityTooltip from './RarityTooltip'
import { Collection } from 'types/reservoir'
import { getPricing } from 'lib/token/pricing'

const SOURCE_ICON = process.env.NEXT_PUBLIC_SOURCE_ICON
const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID
const API_BASE =
  process.env.NEXT_PUBLIC_RESERVOIR_API_BASE || 'https://api.reservoir.tools'
const CURRENCIES = process.env.NEXT_PUBLIC_LISTING_CURRENCIES

type ListingCurrencies = ComponentPropsWithoutRef<
  typeof ListModal
>['currencies']
let listingCurrencies: ListingCurrencies = undefined

if (CURRENCIES) {
  listingCurrencies = JSON.parse(CURRENCIES)
}

type Props = {
  token?: ReturnType<typeof useTokens>['tokens']['data'][0]
  collectionImage: string | undefined
  collectionSize?: number | undefined
  collectionAttributes?: Collection['attributes']
  mutate: MutatorCallback
  setClearCartOpen?: Dispatch<SetStateAction<boolean>>
  setCartToSwap?: Dispatch<SetStateAction<any | undefined>>
}

const TokenCard: FC<Props> = ({
  token,
  collectionImage,
  collectionSize,
  collectionAttributes,
  mutate,
  setClearCartOpen,
  setCartToSwap,
}) => {
  const account = useAccount()
  const { data: signer } = useSigner()
  const { chain: activeChain } = useNetwork()

  const tokensMap = useRecoilValue(getTokensMap)
  const cartCurrency = useRecoilValue(getCartCurrency)
  const [cartTokens, setCartTokens] = useRecoilState(recoilCartTokens)
  const cartPools = useRecoilValue(getPricingPools)

  const reservoirClient = useReservoirClient()
  const singleColumnBreakpoint = useMediaQuery('(max-width: 640px)')

  if (!token) return null

  if (!CHAIN_ID) return null
  const isInTheWrongNetwork = Boolean(signer && activeChain?.id !== +CHAIN_ID)
  const tokenId = `${token?.token?.contract}:${token?.token?.tokenId}`

  const isInCart = Boolean(tokensMap[tokenId])
  const isOwner =
    token?.token?.owner?.toLowerCase() === account?.address?.toLowerCase()
  const imageSize = singleColumnBreakpoint ? 533 : 250

  let price = getPricing(cartPools, token)
  let canAddToCart = true

  if (!price && token.market?.floorAsk?.dynamicPricing?.data?.pool) {
    canAddToCart = false
  }

  return (
    <div
      key={`${token?.token?.contract}${token?.token?.tokenId}`}
      className="group relative mb-6 grid transform-gpu self-start overflow-hidden rounded-[16px] border border-[#D4D4D4] bg-white transition ease-in hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-lg hover:ease-out dark:border-0 dark:bg-neutral-800 dark:ring-1 dark:ring-neutral-600"
    >
      {isInCart ? (
        <div className="absolute top-4 right-4 z-10 flex h-[34px] w-[34px] animate-slide-down items-center justify-center overflow-hidden rounded-full bg-primary-700">
          <FaShoppingCart className="h-[18px] w-[18px] text-white" />
        </div>
      ) : null}

      <Link
        key={`${token?.token?.contract}:${token?.token?.tokenId}`}
        href={`/${token?.token?.contract}/${token?.token?.tokenId}`}
      >
        <a className="mb-[85px]">
          {token?.token?.image ? (
            <Image
              loader={({ src }) => src}
              src={optimizeImage(token?.token?.image, imageSize)}
              alt={`${token?.token?.name}`}
              className="w-full"
              width={imageSize}
              height={imageSize}
              objectFit="cover"
              layout="responsive"
            />
          ) : (
            <div className="relative w-full">
              <div className="absolute inset-0 grid place-items-center backdrop-blur-lg">
                <div>
                  <img
                    src={optimizeImage(collectionImage, imageSize)}
                    alt={`${token?.token?.collection?.name}`}
                    className="mx-auto mb-4 h-16 w-16 overflow-hidden rounded-full border-2 border-white"
                    width="64"
                    height="64"
                  />
                  <div className="reservoir-h6 text-white">
                    No Content Available
                  </div>
                </div>
              </div>
              <img
                src={optimizeImage(collectionImage, imageSize)}
                alt={`${token?.token?.collection?.name}`}
                className="aspect-square w-full object-cover"
                width="250"
                height="250"
              />
            </div>
          )}
        </a>
      </Link>
      <div
        className={`absolute bottom-[0px] w-full bg-white transition-all  dark:bg-neutral-800 md:-bottom-[41px] ${
          !isOwner && !price ? '' : 'group-hover:bottom-[0px]'
        }`}
      >
        <div className="flex items-center justify-between">
          <div
            className="reservoir-subtitle mb-3 overflow-hidden truncate px-4 pt-4 dark:text-white lg:pt-3"
            title={token?.token?.name || token?.token?.tokenId}
          >
            {token?.token?.name || `#${token?.token?.tokenId}`}
          </div>
          {collectionSize &&
            collectionAttributes &&
            collectionAttributes?.length >= 2 &&
            collectionSize >= 2 &&
            token.token?.rarityRank &&
            token.token?.kind != 'erc1155' && (
              <RarityTooltip
                rarityRank={token.token?.rarityRank}
                collectionSize={collectionSize}
              />
            )}
        </div>
        <div className="flex items-center justify-between px-4 pb-4 lg:pb-3">
          {price?.amount?.decimal != null &&
          price?.amount?.decimal != undefined ? (
            <>
              <div className="reservoir-h6">
                <FormatCrypto
                  amount={price?.amount?.decimal}
                  address={price?.currency?.contract}
                  decimals={price?.currency?.decimals}
                  maximumFractionDigits={4}
                />
              </div>
              <div className="text-right">
                {token?.market?.floorAsk?.source && (
                  <img
                    className="h-6 w-6"
                    src={
                      reservoirClient?.source &&
                      reservoirClient.source ===
                        token.market.floorAsk.source.domain &&
                      SOURCE_ICON
                        ? SOURCE_ICON
                        : `${API_BASE}/redirect/sources/${token?.market.floorAsk.source.domain}/logo/v2`
                    }
                    alt=""
                  />
                )}
              </div>
            </>
          ) : !isOwner ? (
            <div className="h-[64px]"></div>
          ) : (
            <div className="h-6"></div>
          )}
        </div>
        {isOwner && (
          <div className="grid">
            <ListModal
              trigger={
                <button className="btn-primary-fill reservoir-subtitle flex h-[40px] items-center justify-center whitespace-nowrap rounded-none text-white focus:ring-0">
                  {price?.amount?.decimal
                    ? 'Create New Listing'
                    : 'List for Sale'}
                </button>
              }
              collectionId={token.token?.contract}
              tokenId={token.token?.tokenId}
              currencies={listingCurrencies}
              onListingComplete={() => {
                mutate()
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
          </div>
        )}
        {price?.amount?.decimal != null &&
          price?.amount?.decimal != undefined &&
          !isOwner && (
            <div
              className={`grid ${
                isInCart || canAddToCart ? 'grid-cols-2' : ''
              }`}
            >
              <BuyNow
                data={{
                  token,
                }}
                mutate={mutate}
                signer={signer}
                isInTheWrongNetwork={isInTheWrongNetwork}
                buttonClassName="btn-primary-fill reservoir-subtitle flex h-[40px] items-center justify-center whitespace-nowrap rounded-none text-white focus:ring-0"
              />
              {isInCart && (
                <button
                  onClick={() => {
                    const newCartTokens = [...cartTokens]
                    const index = newCartTokens.findIndex(
                      (newCartToken) =>
                        newCartToken.token.contract ===
                          token?.token?.contract &&
                        newCartToken.token.tokenId === token?.token?.tokenId
                    )
                    newCartTokens.splice(index, 1)
                    setCartTokens(newCartTokens)
                  }}
                  className="reservoir-subtitle flex h-[40px] items-center justify-center border-t border-neutral-300 text-[#FF3B3B] disabled:cursor-not-allowed dark:border-neutral-600 dark:text-red-300"
                >
                  Remove
                </button>
              )}
              {!isInCart && canAddToCart && (
                <button
                  disabled={isInTheWrongNetwork}
                  onClick={() => {
                    if (token && token.token && token.market) {
                      if (
                        !cartCurrency ||
                        price?.currency?.contract === cartCurrency?.contract
                      ) {
                        setCartTokens([
                          ...cartTokens,
                          {
                            token: token.token,
                            market: token.market,
                          },
                        ])
                      } else {
                        setCartToSwap &&
                          setCartToSwap([
                            {
                              token: token.token,
                              market: token.market,
                            },
                          ])
                        setClearCartOpen && setClearCartOpen(true)
                      }
                    }
                  }}
                  className="reservoir-subtitle flex h-[40px] items-center justify-center border-t border-neutral-300 disabled:cursor-not-allowed dark:border-neutral-600"
                >
                  Add to Cart
                </button>
              )}
            </div>
          )}
      </div>
    </div>
  )
}

export default TokenCard
