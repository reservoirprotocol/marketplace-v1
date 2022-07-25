import { paths } from '@reservoir0x/reservoir-kit-client'
import fetcher from 'lib/fetcher'
import setParams from 'lib/params'
import { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import useSWRInfinite, { SWRInfiniteKeyLoader } from 'swr/infinite'

const PROXY_API_BASE = process.env.NEXT_PUBLIC_PROXY_API_BASE

type Collections = paths['/collections/v4']['get']['responses']['200']['schema']

export default function useCommunity(collectionId: string) {
  const { ref, inView } = useInView()

  const pathname = `${PROXY_API_BASE}/collections/v4`

  const communities = useSWRInfinite<Collections>(
    (index, previousPageData) =>
      getKey(pathname, collectionId, index, previousPageData),
    fetcher,
    {
      revalidateFirstPage: false,
    }
  )

  // Fetch more data when component is visible
  useEffect(() => {
    if (inView) {
      communities.setSize(communities.size + 1)
    }
  }, [inView])

  return { communities, ref }
}

const getKey: (
  pathname: string,
  collectionId: string,
  ...base: Parameters<SWRInfiniteKeyLoader>
) => ReturnType<SWRInfiniteKeyLoader> = (
  pathname: string,
  collectionId: string,
  index: number,
  previousPageData: Collections
) => {
  // Reached the end
  if (previousPageData && previousPageData?.collections?.length === 0)
    return null

  let query: paths['/collections/v4']['get']['parameters']['query'] = {
    limit: 20,
    community: collectionId,
    sortBy: '7DayVolume',
  }

  const href = setParams(pathname, query)

  return href
}
