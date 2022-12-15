import { FC, useEffect, useState } from 'react'
import LoadingCard from './LoadingCard'
import { useInView } from 'react-intersection-observer'
import Masonry from 'react-masonry-css'
import useTokens from '../hooks/useTokens'
import SwapCartModal from 'components/SwapCartModal'
import TokenCard from './TokenCard'
import { Token } from 'recoil/cart/atom'
import { getPricingPools } from 'recoil/cart'
import { Collection } from 'types/reservoir'
import { useRouter } from 'next/router'
import { useRecoilValue } from 'recoil'
import { getPricing } from 'lib/token/pricing'

const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID

type Props = {
  tokens: ReturnType<typeof useTokens>['tokens']
  collectionImage: string | undefined
  collectionSize?: number | undefined
  collectionAttributes?: Collection['attributes']
  viewRef: ReturnType<typeof useInView>['ref']
  isLoading: boolean
}

const TokensGrid: FC<Props> = ({
  tokens,
  viewRef,
  collectionImage,
  collectionSize,
  collectionAttributes,
  isLoading,
}) => {
  const { data, mutate } = tokens
  const [clearCartOpen, setClearCartOpen] = useState(false)
  const [cartToSwap, setCartToSwap] = useState<undefined | Token[]>()
  const router = useRouter()
  const [sortedTokens, setSortedTokens] = useState<Props['tokens']['data']>([])
  const didReachEnd = tokens.isFetchingInitialData || !tokens.hasNextPage
  const sortBy = router.query['sortBy']?.toString()
  const sortDirection = router.query['sortDirection']?.toString()
  const cartPools = useRecoilValue(getPricingPools)

  useEffect(() => {
    const cartHasPool = Object.values(cartPools).length > 0
    if (cartHasPool && (sortBy === 'floorAskPrice' || !sortBy)) {
      setSortedTokens(
        data.slice().sort((a, b) => {
          const aPrice = getPricing(cartPools, a)
          const bPrice = getPricing(cartPools, b)

          if (sortDirection === 'asc' || !sortDirection) {
            return (
              (aPrice?.amount?.decimal || 0) - (bPrice?.amount?.decimal || 0)
            )
          } else {
            return (
              (aPrice?.amount?.decimal || 0) + (bPrice?.amount?.decimal || 0)
            )
          }
        })
      )
    } else {
      setSortedTokens(data)
    }
  }, [data, sortBy, sortDirection, cartPools])

  if (!CHAIN_ID) return null

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
        {tokens.isFetchingInitialData || isLoading
          ? Array(20)
              .fill(null)
              .map((_, index) => <LoadingCard key={`loading-card-${index}`} />)
          : sortedTokens?.map((token) => {
              return (
                <TokenCard
                  token={token}
                  collectionImage={collectionImage}
                  collectionSize={collectionSize}
                  collectionAttributes={collectionAttributes}
                  mutate={mutate}
                  setClearCartOpen={setClearCartOpen}
                  setCartToSwap={setCartToSwap}
                  key={`${token?.token?.contract}:${token?.token?.tokenId}`}
                />
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
