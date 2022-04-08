import { paths } from '@reservoir0x/client-sdk'
import fetcher from 'lib/fetcher'
import setParams from 'lib/params'
import { NextRouter } from 'next/router'
import { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import useSWRInfinite, { SWRInfiniteKeyLoader } from 'swr/infinite'

type Tokens = paths['/tokens/v2']['get']['responses']['200']['schema']

export default function useTokens(
  apiBase: string | undefined,
  collectionId: string | undefined,
  fallbackData: Tokens[],
  router: NextRouter
) {
  const { ref, inView } = useInView()

  function getUrl() {
    if (!collectionId) return undefined

    const url = new URL('/tokens/v2', apiBase)

    return url
  }

  const url = getUrl()

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
  url: URL | undefined,
  collectionId: string | undefined,
  router: NextRouter,
  ...base: Parameters<SWRInfiniteKeyLoader>
) => ReturnType<SWRInfiniteKeyLoader> = (
  url: URL | undefined,
  collectionId: string | undefined,
  router: NextRouter,
  index: number,
  previousPageData: paths['/tokens/v2']['get']['responses']['200']['schema']
) => {
  // Reached the end
  if (previousPageData && previousPageData?.tokens?.length === 0) return null

  if (!url) return null

  let query: paths['/tokens/v2']['get']['parameters']['query'] = {
    limit: 20,
    collection: collectionId,
  }

  if (index !== 0) query.continuation = previousPageData.continuation

  // Convert the client sort query into the API sort query
  if (router.query?.sort) {
    if (`${router.query?.sort}` === 'highest_offer') {
      query.sortBy = 'topBidValue'
    }

    // if (`${router.query?.sort}` === 'token_id') {
    //   query.sortBy = 'tokenId'
    // }
  } else {
    query.sortBy = 'floorAskPrice'
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
