import { FC, useState } from 'react'
import LoadingCard from './LoadingCard'
import Link from 'next/link'
import { optimizeImage } from 'lib/optmizeImage'
import { useInView } from 'react-intersection-observer'
import Masonry from 'react-masonry-css'
import Image from 'next/image'
import { FaShoppingCart } from 'react-icons/fa'
import { useRecoilState, useRecoilValue } from 'recoil'
import { useAccount, useNetwork, useSigner } from 'wagmi'
import BuyNow from 'components/BuyNow'
import { useReservoirClient } from '@reservoir0x/reservoir-kit-ui'
import FormatCrypto from 'components/FormatCrypto'
import useTokens from '../hooks/useTokens'
import recoilCartTokens from 'recoil/cart/atom'
import { getCartCurrency, getTokensMap } from 'recoil/cart'
import SwapCartModal from 'components/SwapCartModal'

const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID
const SOURCE_ICON = process.env.NEXT_PUBLIC_SOURCE_ICON
const API_BASE =
  process.env.NEXT_PUBLIC_RESERVOIR_API_BASE || 'https://api.reservoir.tools'

type Props = {
  tokens: ReturnType<typeof useTokens>['tokens']
  collectionImage: string | undefined
  viewRef: ReturnType<typeof useInView>['ref']
}

const TokensGrid: FC<Props> = ({ tokens, viewRef, collectionImage }) => {
  const [cartTokens, setCartTokens] = useRecoilState(recoilCartTokens)
  const cartCurrency = useRecoilValue(getCartCurrency)
  const tokensMap = useRecoilValue(getTokensMap)
  const { data: signer } = useSigner()
  const { chain: activeChain } = useNetwork()
  const { data, mutate } = tokens
  const account = useAccount()
  const reservoirClient = useReservoirClient()
  const [clearCartOpen, setClearCartOpen] = useState(false)
  const [cartToSwap, setCartToSwap] = useState<undefined | typeof cartTokens>()

  const didReachEnd = tokens.isFetchingInitialData || !tokens.hasNextPage

  if (!CHAIN_ID) return null

  const isInTheWrongNetwork = Boolean(signer && activeChain?.id !== +CHAIN_ID)

  return (
    <>
      <SwapCartModal
        open={clearCartOpen}
        setOpen={setClearCartOpen}
        cart={cartToSwap}
      />
      <Masonry
        key="tokensGridMasonry"
        breakpointCols={{
          default: 6,
          1900: 5,
          1536: 4,
          1280: 3,
          1024: 2,
          768: 2,
          640: 2,
          500: 1,
        }}
        className="masonry-grid"
        columnClassName="masonry-grid_column"
      >
        {tokens.isFetchingInitialData
          ? Array(10)
              .fill(null)
              .map((_, index) => <LoadingCard key={`loading-card-${index}`} />)
          : data?.map((tokenData, idx) => {
              const token = {
                ...tokenData?.token,
                ...tokenData?.market,
              }
              if (!token) return null

              const isInCart = Boolean(
                tokensMap[`${token.contract}:${token.tokenId}`]
              )
              const isOwner =
                token.owner?.toLowerCase() === account?.address?.toLowerCase()
              return (
                <div
                  key={`${token.contract}${token.tokenId}`}
                  className="group relative mb-6 grid transform-gpu self-start overflow-hidden rounded-[16px] border border-[#D4D4D4] bg-white transition ease-in hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-lg hover:ease-out dark:border-0 dark:bg-neutral-800 dark:ring-1 dark:ring-neutral-600"
                >
                  {isInCart ? (
                    <div className="absolute top-4 right-4 z-10 flex h-[34px] w-[34px] animate-slide-down items-center justify-center overflow-hidden rounded-full bg-primary-700">
                      <FaShoppingCart className="h-[18px] w-[18px] text-white" />
                    </div>
                  ) : null}

                  <Link
                    key={`${token?.collection?.name}${idx}`}
                    href={`/${token?.contract}/${token?.tokenId}`}
                  >
                    <a className="mb-[85px]">
                      {token?.image ? (
                        <Image
                          loader={({ src }) => src}
                          src={optimizeImage(token?.image, 250)}
                          alt={`${token?.name}`}
                          className="w-full"
                          width={250}
                          height={250}
                          objectFit="cover"
                          layout="responsive"
                        />
                      ) : (
                        <div className="relative w-full">
                          <div className="absolute inset-0 grid place-items-center backdrop-blur-lg">
                            <div>
                              <img
                                src={optimizeImage(collectionImage, 250)}
                                alt={`${token?.collection?.name}`}
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
                            src={optimizeImage(collectionImage, 250)}
                            alt={`${token?.collection?.name}`}
                            className="aspect-square w-full object-cover"
                            width="250"
                            height="250"
                          />
                        </div>
                      )}
                    </a>
                  </Link>
                  <div
                    className={`absolute bottom-[0px] w-full bg-white transition-all group-hover:bottom-[0px] dark:bg-neutral-800 ${
                      token.floorAsk?.price?.amount != null &&
                      token.floorAsk.price.amount != undefined &&
                      !isOwner
                        ? 'md:-bottom-[41px]'
                        : ''
                    }`}
                  >
                    <div
                      className="reservoir-subtitle mb-3 overflow-hidden truncate px-4 pt-4 dark:text-white lg:pt-3"
                      title={token?.name || token?.tokenId}
                    >
                      {token?.name || `#${token?.tokenId}`}
                    </div>
                    <div className="flex items-center justify-between px-4 pb-4 lg:pb-3">
                      {token?.floorAsk?.price !== null ? (
                        <>
                          <div className="reservoir-h6">
                            <FormatCrypto
                              amount={token?.floorAsk?.price?.amount?.decimal}
                              address={
                                token?.floorAsk?.price?.currency?.contract
                              }
                              decimals={
                                token.floorAsk?.price?.currency?.decimals
                              }
                              maximumFractionDigits={2}
                            />
                          </div>
                          <div className="text-right">
                            {token?.floorAsk?.source && (
                              <img
                                className="h-6 w-6"
                                src={
                                  reservoirClient?.source &&
                                  reservoirClient.source ===
                                    token.floorAsk.source.domain &&
                                  SOURCE_ICON
                                    ? SOURCE_ICON
                                    : `${API_BASE}/redirect/sources/${token?.floorAsk.source.domain}/logo/v2`
                                }
                                alt=""
                              />
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="h-6"></div>
                      )}
                    </div>
                    {token.floorAsk?.price?.amount?.decimal != null &&
                      token.floorAsk?.price?.amount?.decimal != undefined &&
                      !isOwner && (
                        <div className="grid grid-cols-2">
                          <BuyNow
                            data={{
                              token: tokenData,
                            }}
                            mutate={mutate}
                            signer={signer}
                            isInTheWrongNetwork={isInTheWrongNetwork}
                            buttonClassName="btn-primary-fill reservoir-subtitle flex h-[40px] items-center justify-center whitespace-nowrap rounded-none text-white focus:ring-0"
                          />
                          {isInCart ? (
                            <button
                              onClick={() => {
                                const newCartTokens = [...cartTokens]
                                const index = newCartTokens.findIndex(
                                  (newCartToken) =>
                                    newCartToken.token.contract ===
                                      token?.contract &&
                                    newCartToken.token.tokenId === token.tokenId
                                )
                                newCartTokens.splice(index, 1)
                                setCartTokens(newCartTokens)
                              }}
                              className="reservoir-subtitle flex h-[40px] items-center justify-center border-t border-neutral-300 text-[#FF3B3B] disabled:cursor-not-allowed dark:border-neutral-600 dark:text-red-300"
                            >
                              Remove
                            </button>
                          ) : (
                            <button
                              disabled={isInTheWrongNetwork}
                              onClick={() => {
                                if (
                                  tokenData &&
                                  tokenData.token &&
                                  tokenData.market
                                ) {
                                  if (
                                    !cartCurrency ||
                                    tokenData.market.floorAsk?.price?.currency
                                      ?.contract === cartCurrency?.contract
                                  ) {
                                    setCartTokens([
                                      ...cartTokens,
                                      {
                                        token: tokenData.token,
                                        market: tokenData.market,
                                      },
                                    ])
                                  } else {
                                    setCartToSwap([
                                      {
                                        token: tokenData.token,
                                        market: tokenData.market,
                                      },
                                    ])
                                    setClearCartOpen(true)
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
            })}
        {!didReachEnd &&
          Array(10)
            .fill(null)
            .map((_, index) => {
              if (index === 0) {
                return (
                  <LoadingCard
                    viewRef={viewRef}
                    key={`loading-card-${index}`}
                  />
                )
              }
              return <LoadingCard key={`loading-card-${index}`} />
            })}
      </Masonry>
    </>
  )
}

export default TokensGrid
