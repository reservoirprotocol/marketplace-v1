import { paths } from '@reservoir0x/client-sdk'
import fetcher from 'lib/fetcher'
import setParams from 'lib/params'
import { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import useSWRInfinite, { SWRInfiniteKeyLoader } from 'swr/infinite'

const PROXY_API_BASE = process.env.NEXT_PUBLIC_PROXY_API_BASE

type Positions =
  paths['/users/{user}/positions/v1']['get']['responses']['200']['schema']

export default function useUserPositions(
  fallbackData: Positions[],
  side: 'buy' | 'sell',
  user: string | undefined
) {
  const { ref, inView } = useInView()

  const pathname = `${PROXY_API_BASE}/users/${user}/positions/v1`

  const positions = useSWRInfinite<Positions>(
    (index, previousPageData) =>
      getKey(
        { pathname, proxyApi: PROXY_API_BASE, side },
        index,
        previousPageData
      ),
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
    pathname: string
    proxyApi: string | undefined
    side: 'buy' | 'sell'
  },
  ...base: Parameters<SWRInfiniteKeyLoader>
) => ReturnType<SWRInfiniteKeyLoader>

const getKey: InfiniteKeyLoader = (
  custom: {
    pathname: string
    proxyApi: string | undefined
    side: 'buy' | 'sell'
  },
  index: number,
  previousPageData: Positions
) => {
  const { pathname, proxyApi, side } = custom
  if (!proxyApi) {
    console.debug(
      'Environment variable NEXT_PUBLIC_PROXY_API_BASE is undefined.'
    )
    return null
  }

  // Reached the end
  if (previousPageData && previousPageData?.positions?.length === 0) return null

  let query: paths['/users/{user}/positions/v1']['get']['parameters']['query'] =
    {
      status: 'valid',
      side,
      limit: 20,
      offset: index * 20,
    }

  const href = setParams(pathname, query)

  return href
}
