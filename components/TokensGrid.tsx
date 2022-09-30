import { FC, useState } from 'react'
import LoadingCard from './LoadingCard'
import { useInView } from 'react-intersection-observer'
import Masonry from 'react-masonry-css'
import { useRecoilState } from 'recoil'
import useTokens from '../hooks/useTokens'
import recoilCartTokens from 'recoil/cart/atom'
import SwapCartModal from 'components/SwapCartModal'
import TokenCard from './TokenCard'

const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID

type Props = {
  tokens: ReturnType<typeof useTokens>['tokens']
  collectionImage: string | undefined
  viewRef: ReturnType<typeof useInView>['ref']
}

const TokensGrid: FC<Props> = ({ tokens, viewRef, collectionImage }) => {
  const { data, mutate } = tokens
  const [cartTokens] = useRecoilState(recoilCartTokens)
  const [clearCartOpen, setClearCartOpen] = useState(false)
  const [cartToSwap, setCartToSwap] = useState<undefined | typeof cartTokens>()

  const didReachEnd = tokens.isFetchingInitialData || !tokens.hasNextPage

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
        {tokens.isFetchingInitialData
          ? Array(10)
              .fill(null)
              .map((_, index) => <LoadingCard key={`loading-card-${index}`} />)
          : data?.map((token) => {
              return (
                <TokenCard
                  token={token}
                  collectionImage={collectionImage}
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
