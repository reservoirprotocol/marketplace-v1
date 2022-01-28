import { paths } from 'interfaces/apiTypes'
import fetcher from 'lib/fetcher'
import setParams from 'lib/params'
import { NextRouter } from 'next/router'
import { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import useSWRInfinite, { SWRInfiniteKeyLoader } from 'swr/infinite'

type Tokens = paths['/tokens']['get']['responses']['200']['schema']

export default function useTokens(
  apiBase: string | undefined,
  collectionId: string | undefined,
  fallbackData: Tokens[],
  router: NextRouter
) {
  const { ref, inView } = useInView()

  const url = new URL('/tokens', apiBase)

  const tokens = useSWRInfinite<Tokens>(
    (index, previousPageData) =>
      getKey(url, collectionId, router, index, previousPageData),
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
  url: URL,
  collectionId: string | undefined,
  router: NextRouter,
  ...base: Parameters<SWRInfiniteKeyLoader>
) => ReturnType<SWRInfiniteKeyLoader> = (
  url: URL,
  collectionId: string | undefined,
  router: NextRouter,
  index: number,
  previousPageData: paths['/tokens']['get']['responses']['200']['schema']
) => {
  // Reached the end
  if (previousPageData && previousPageData?.tokens?.length === 0) return null

  let query: paths['/tokens']['get']['parameters']['query'] = {
    limit: 20,
    offset: index * 20,
    collection: collectionId,
  }

  // Convert the client sort query into the API sort query
  if (router.query?.sort) {
    if (`${router.query?.sort}` === 'highest_offer') {
      query.sortBy = 'topBuyValue'
      query.sortDirection = 'desc'
    }

    if (`${router.query?.sort}` === 'token_id') {
      query.sortBy = 'tokenId'
      query.sortDirection = 'asc'
    }
  } else {
    query.sortBy = 'floorSellValue'
    query.sortDirection = 'asc'
  }

  Object.keys(router.query).forEach((key) => {
    key.startsWith('attributes[') &&
      key.endsWith(']') &&
      router.query[key] !== '' &&
      url.searchParams.set(key, `${router.query[key]}`)
  })

  setParams(url, query)

  return url.href
}
