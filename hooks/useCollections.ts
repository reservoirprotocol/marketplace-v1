import { paths } from '@reservoir0x/client-sdk/dist/types/api'
import fetcher from 'lib/fetcher'
import setParams from 'lib/params'
import { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import useSWRInfinite, { SWRInfiniteKeyLoader } from 'swr/infinite'

const PROXY_API_BASE = process.env.NEXT_PUBLIC_PROXY_API_BASE

type Collections = paths['/collections/v3']['get']['responses']['200']['schema']

export default function useCollections(fallback?: Collections) {
  const { ref, inView } = useInView()

  const pathname = `${PROXY_API_BASE}/collections/v3`

  const collections = useSWRInfinite<Collections>(
    (index, previousPageData) => getKey(pathname, index, previousPageData),
    fetcher,
    {
      revalidateFirstPage: false,
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
  ...base: Parameters<SWRInfiniteKeyLoader>
) => ReturnType<SWRInfiniteKeyLoader> = (
  pathname: string,
  index: number,
  previousPageData: paths['/collections/v3']['get']['responses']['200']['schema']
) => {
  // Reached the end
  if (previousPageData && previousPageData?.collections?.length === 0)
    return null

  let query: paths['/collections/v3']['get']['parameters']['query'] = {
    limit: 20,
    offset: index * 20,
    sortBy: '7DayVolume',
  }

  const href = setParams(pathname, query)

  return href
}
