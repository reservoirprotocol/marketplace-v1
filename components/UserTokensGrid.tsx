import { FC, ComponentPropsWithoutRef, useEffect } from 'react'
import LoadingCard from './LoadingCard'
import { ListModal, useUserTokens } from '@reservoir0x/reservoir-kit-ui'
import { useInView } from 'react-intersection-observer'
import TokenCard from './TokenCard'

const CURRENCIES = process.env.NEXT_PUBLIC_LISTING_CURRENCIES

type ListingCurrencies = ComponentPropsWithoutRef<
  typeof ListModal
>['currencies']
let listingCurrencies: ListingCurrencies = undefined

if (CURRENCIES) {
  listingCurrencies = JSON.parse(CURRENCIES)
}

type Props = {
  userTokens: ReturnType<typeof useUserTokens>
  owner: string
  mutate: () => any
}

const UserTokensGrid: FC<Props> = ({ userTokens, mutate, owner }) => {
  const {
    data: tokens,
    isFetchingInitialData,
    isFetchingPage,
    hasNextPage,
    fetchNextPage,
  } = userTokens
  const isEmpty = tokens.length === 0
  const { ref, inView } = useInView()

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage()
    }
  }, [inView])

  if (isEmpty && !isFetchingPage) {
    return (
      <div className="grid justify-center text-xl font-semibold">No tokens</div>
    )
  }

  return (
    <div className="mx-auto mb-8 grid max-w-[2400px] gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5">
      {isFetchingInitialData
        ? Array(10)
            .fill(null)
            .map((_, index) => <LoadingCard key={`loading-card-${index}`} />)
        : tokens?.map((token) => (
            <TokenCard
              token={{
                token: {
                  contract: token?.token?.contract || '',
                  tokenId: token?.token?.tokenId || '',
                  owner,
                  ...token?.token,
                },
                market: {
                  floorAsk: { ...token?.ownership?.floorAsk },
                  topBid: { ...token?.token?.topBid },
                },
              }}
              key={`${token?.token?.contract}${token?.token?.tokenId}`}
              mutate={mutate}
              collectionImage={token?.token?.collection?.imageUrl}
            />
          ))}
      {isFetchingPage ? (
        Array(10)
          .fill(null)
          .map((_, index) => {
            if (index === 0) {
              return <LoadingCard key={`loading-card-${index}`} />
            }
            return <LoadingCard key={`loading-card-${index}`} />
          })
      ) : (
        <span ref={ref}></span>
      )}
    </div>
  )
}

export default UserTokensGrid
