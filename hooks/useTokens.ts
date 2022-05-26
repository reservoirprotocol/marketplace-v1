import { paths } from '@reservoir0x/client-sdk/dist/types/api'
import fetcher from 'lib/fetcher'
import setParams from 'lib/params'
import { NextRouter } from 'next/router'
import { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import useSWRInfinite, { SWRInfiniteKeyLoader } from 'swr/infinite'

const PROXY_API_BASE = process.env.NEXT_PUBLIC_PROXY_API_BASE
const SOURCE_ID = process.env.NEXT_PUBLIC_SOURCE_ID

type Tokens = paths['/tokens/v4']['get']['responses']['200']['schema']

export default function useTokens(
  collectionId: string | undefined,
  fallbackData: Tokens[],
  router: NextRouter,
  source?: boolean | undefined
) {
  const { ref, inView } = useInView()

  function getUrl() {
    if (!collectionId) return undefined

    const pathname = `${PROXY_API_BASE}/tokens/v4`

    return pathname
  }

  const pathname = getUrl()

  const tokens = useSWRInfinite<Tokens>(
    (index, previousPageData) =>
      getKey(pathname, collectionId, source, router, index, previousPageData),
    fetcher,
    {
      revalidateFirstPage: false,
      fallbackData,
    }
  )

  // Fetch more data when component is visible
  useEffect(() => {
    if (inView) {
      tokens.setSize(tokens.size + 1)
    }
  }, [inView])

  return { tokens, ref }
}

const getKey: (
  pathname: string | undefined,
  collectionId: string | undefined,
  source: boolean | undefined,
  router: NextRouter,
  ...base: Parameters<SWRInfiniteKeyLoader>
) => ReturnType<SWRInfiniteKeyLoader> = (
  pathname: string | undefined,
  collectionId: string | undefined,
  source: boolean | undefined,
  router: NextRouter,
  index: number,
  previousPageData: paths['/tokens/v4']['get']['responses']['200']['schema']
) => {
  // Reached the end
  if (
    previousPageData &&
    (previousPageData.tokens?.length === 0 || !previousPageData.continuation)
  )
    return null

  if (!pathname) return null

  let query: paths['/tokens/v4']['get']['parameters']['query'] = {
    limit: 20,
    collection: collectionId,
  }

  if (index !== 0 && previousPageData.continuation !== null) {
    query.continuation = previousPageData.continuation
  }

  if (source) query.source = SOURCE_ID

  // Convert the client sort query into the API sort query
  if (router.query?.sort) {
    if (`${router.query?.sort}` === 'highest_offer') {
      query.sortBy = 'topBidValue'
    }
  } else {
    query.sortBy = 'floorAskPrice'
  }

  // Extract all queries of attribute type
  const attributes = Object.keys(router.query).filter(
    (key) =>
      key.startsWith('attributes[') &&
      key.endsWith(']') &&
      router.query[key] !== ''
  )

  const query2: { [key: string]: any } = {}

  // Add all selected attributes to the query
  if (attributes.length > 0) {
    attributes.forEach((key) => {
      const value = router.query[key]?.toString()
      if (value) {
        query2[key] = value
      }
    })
  }

  const href = setParams(pathname, { ...query, ...query2 })

  return href
}
