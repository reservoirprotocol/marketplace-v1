import { paths } from 'interfaces/apiTypes'
import fetcher from 'lib/fetcher'
import setParams from 'lib/params'
import { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import useSWRInfinite, { SWRInfiniteKeyLoader } from 'swr/infinite'

type Positions =
  paths['/users/{user}/positions']['get']['responses']['200']['schema']

export default function useUserPositions(
  apiBase: string | undefined,
  fallbackData: Positions[],
  side: 'buy' | 'sell',
  user: string | undefined
) {
  const { ref, inView } = useInView()

  const url = new URL(`/users/${user}/positions`, apiBase)

  const positions = useSWRInfinite<Positions>(
    (index, previousPageData) =>
      getKey({ url, apiBase, side }, index, previousPageData),
    fetcher,
    {
      revalidateFirstPage: false,
      fallbackData,
    }
  )

  // Fetch more data when component is visible
  useEffect(() => {
    if (inView) {
      positions.setSize(positions.size + 1)
    }
  }, [inView])

  return { positions, ref }
}

type InfiniteKeyLoader = (
  custom: {
    url: URL
    apiBase: string | undefined
    side: 'buy' | 'sell'
  },
  ...base: Parameters<SWRInfiniteKeyLoader>
) => ReturnType<SWRInfiniteKeyLoader>

const getKey: InfiniteKeyLoader = (
  custom: {
    url: URL
    apiBase: string | undefined
    side: 'buy' | 'sell'
  },
  index: number,
  previousPageData: Positions
) => {
  const { url, apiBase, side } = custom
  if (!apiBase) {
    console.debug('Environment variable NEXT_PUBLIC_API_BASE is undefined.')
    return null
  }

  // Reached the end
  if (previousPageData && previousPageData?.positions?.length === 0) return null

  let query: paths['/users/{user}/positions']['get']['parameters']['query'] = {
    status: 'valid',
    side,
    limit: 20,
    offset: index * 20,
  }

  setParams(url, query)

  return url.href
}
