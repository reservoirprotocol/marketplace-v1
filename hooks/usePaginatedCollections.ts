import { paths } from '@reservoir0x/reservoir-kit-client'
import fetcher from 'lib/fetcher'
import setParams from 'lib/params'
import { NextRouter } from 'next/router'
import { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import useSWRInfinite, { SWRInfiniteKeyLoader } from 'swr/infinite'

const PROXY_API_BASE = process.env.NEXT_PUBLIC_PROXY_API_BASE
const COLLECTION = process.env.NEXT_PUBLIC_COLLECTION
const COMMUNITY = process.env.NEXT_PUBLIC_COMMUNITY
const COLLECTION_SET_ID = process.env.NEXT_PUBLIC_COLLECTION_SET_ID

type Collections = paths['/collections/v5']['get']['responses']['200']['schema']

export default function usePaginatedCollections(
  router: NextRouter,
  fallback?: Collections
) {
  const { ref, inView } = useInView()

  const pathname = `${PROXY_API_BASE}/collections/v5`

  const sortBy = router.query['sort']?.toString()

  const collections = useSWRInfinite<Collections>(
    (index, previousPageData) =>
      getKey(pathname, sortBy, index, previousPageData),
    fetcher,
    {
      revalidateOnMount: true,
      fallbackData: [
        {
          collections: fallback?.collections,
        },
      ],
    }
  )

  // Fetch more data when component is visible
  useEffect(() => {
    if (inView) {
      collections.setSize(collections.size + 1)
    }
  }, [inView])

  return { collections, ref }
}

const getKey: (
  pathname: string,
  sortBy: string | undefined,
  ...base: Parameters<SWRInfiniteKeyLoader>
) => ReturnType<SWRInfiniteKeyLoader> = (
  pathname: string,
  sortBy: string | undefined,
  index: number,
  previousPageData: paths['/collections/v5']['get']['responses']['200']['schema']
) => {
  // Reached the end
  if (previousPageData && !previousPageData?.continuation) return null

  let query: paths['/collections/v5']['get']['parameters']['query'] = {
    limit: 20,
    sortBy: '1DayVolume',
    normalizeRoyalties: true,
  }

  if (COLLECTION && !COMMUNITY) query.contract = [COLLECTION]
  if (COMMUNITY) query.community = COMMUNITY
  if (COLLECTION_SET_ID) query.collectionsSetId = COLLECTION_SET_ID

  if (previousPageData) query.continuation = previousPageData.continuation

  if (sortBy === '30DayVolume' || sortBy === '7DayVolume') query.sortBy = sortBy

  const href = setParams(pathname, query)

  return href
}
