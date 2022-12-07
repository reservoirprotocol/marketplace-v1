import { FC, useEffect } from 'react'
import LoadingCard from './LoadingCard'
import { useUserTokens } from '@reservoir0x/reservoir-kit-ui'
import { useInView } from 'react-intersection-observer'
import TokenCard from './TokenCard'
import { paths } from '@reservoir0x/reservoir-kit-client'

const COLLECTION = process.env.NEXT_PUBLIC_COLLECTION
const COMMUNITY = process.env.NEXT_PUBLIC_COMMUNITY
const COLLECTION_SET_ID = process.env.NEXT_PUBLIC_COLLECTION_SET_ID

type Props = {
  fallback: {
    tokens: paths['/users/{user}/tokens/v5']['get']['responses']['200']['schema']
  }
  owner: string
}

const UserTokensGrid: FC<Props> = ({ fallback, owner }) => {
  const userTokensParams: Parameters<typeof useUserTokens>['1'] = {
    limit: 20,
    includeTopBid: true,
  }
  if (COLLECTION_SET_ID) {
    userTokensParams.collectionsSetId = COLLECTION_SET_ID
  } else {
    if (COMMUNITY) userTokensParams.community = COMMUNITY
  }

  if (COLLECTION && (!COMMUNITY || !COLLECTION_SET_ID)) {
    userTokensParams.collection = COLLECTION
  }
  const userTokens = useUserTokens(owner, userTokensParams, {
    fallbackData: [fallback.tokens],
    revalidateOnMount: false,
  })

  useEffect(() => {
    userTokens.mutate()
    return () => {
      userTokens.setSize(1)
    }
  }, [])

  const {
    data: tokens,
    isFetchingInitialData,
    isFetchingPage,
    hasNextPage,
    fetchNextPage,
    mutate,
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
