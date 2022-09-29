import { FC, ComponentPropsWithoutRef } from 'react'
import LoadingCard from './LoadingCard'
import { ListModal } from '@reservoir0x/reservoir-kit-ui'
import useUserTokens from 'hooks/useUserTokens'
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
  data: ReturnType<typeof useUserTokens>
  owner: string
  mutate: () => any
}

const UserTokensGrid: FC<Props> = ({
  data: { tokens, ref },
  owner,
  mutate,
}) => {
  const { data, isValidating } = tokens
  const mappedTokens = data ? data.map(({ tokens }) => tokens).flat() : []
  const isEmpty = mappedTokens.length === 0
  const didReactEnd = isEmpty || data?.[data.length - 1]?.tokens?.length === 0

  if (isEmpty) {
    return (
      <div className="grid justify-center text-xl font-semibold">No tokens</div>
    )
  }

  return (
    <div className="mx-auto mb-8 grid max-w-[2400px] gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5">
      {isEmpty && isValidating
        ? Array(20).map((_, index) => (
            <LoadingCard key={`loading-card-${index}`} />
          ))
        : mappedTokens?.map((token) => (
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
      {!didReactEnd &&
        Array(20)
          .fill(null)
          .map((_, index) => {
            if (index === 0) {
              return <LoadingCard viewRef={ref} key={`loading-card-${index}`} />
            }
            return <LoadingCard key={`loading-card-${index}`} />
          })}
    </div>
  )
}

export default UserTokensGrid
