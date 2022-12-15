import { paths } from '@reservoir0x/reservoir-kit-client'
import { useReservoirClient } from '@reservoir0x/reservoir-kit-ui'
import { NextRouter } from 'next/router'
import { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import { useTokens as useTokensRk } from '@reservoir0x/reservoir-kit-ui'

const PROXY_API_BASE = process.env.NEXT_PUBLIC_PROXY_API_BASE

type Tokens = paths['/tokens/v5']['get']['responses']['200']['schema']

export default function useTokens(
  collectionId: string | undefined,
  fallbackData: Tokens[],
  router: NextRouter,
  includeTopBid: boolean = true,
  source?: boolean | undefined
) {
  const { ref, inView } = useInView()
  const reservoirClient = useReservoirClient()

  const query: Parameters<typeof useTokensRk>['0'] = {
    limit: 20,
    collection: collectionId,
    includeTopBid: includeTopBid,
    sortBy: 'floorAskPrice',
    sortDirection: 'asc',
    includeDynamicPricing: true,
  }

  if (source) query.source = reservoirClient?.source

  const sortDirection = router.query['sortDirection']?.toString()
  const sortBy = router.query['sortBy']?.toString()

  if (sortBy === 'tokenId' || sortBy === 'rarity') query.sortBy = sortBy
  if (sortDirection === 'desc') query.sortDirection = 'desc'

  // Extract all queries of attribute type
  Object.keys(router.query)
    .filter(
      (key) =>
        key.startsWith('attributes[') &&
        key.endsWith(']') &&
        router.query[key] !== ''
    )
    .forEach((key) => {
      const value = router.query[key]?.toString()
      if (value) {
        //@ts-ignore: Attributes that have dynamic keys don't work very well with openapi types
        query[key] = value
      }
    })

  const tokens = useTokensRk(query, {
    revalidateFirstPage: false,
    fallbackData,
  })

  // Fetch more data when component is visible
  useEffect(() => {
    if (inView) {
      tokens.fetchNextPage()
    }
  }, [inView])

  return { tokens, ref }
}
