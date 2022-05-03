import { paths } from '@reservoir0x/client-sdk/dist/types/api'
import fetcher from 'lib/fetcher'
import setParams from 'lib/params'
import { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import useSWRInfinite, { SWRInfiniteKeyLoader } from 'swr/infinite'

const PROXY_API_BASE = process.env.NEXT_PUBLIC_PROXY_API_BASE

type Transfers = paths['/transfers/v2']['get']['responses']['200']['schema']

export default function useUserActivity(
  fallbackData: Transfers[],
  user: string | undefined
) {
  const { ref, inView } = useInView()

  const pathname = `${PROXY_API_BASE}/transfers/v2`

  const transfers = useSWRInfinite<Transfers>(
    (index, previousPageData) =>
      getKey(
        { pathname, user, proxyApi: PROXY_API_BASE },
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
      transfers.setSize(transfers.size + 1)
    }
  }, [inView])

  return { transfers, ref }
}

type InfiniteKeyLoader = (
  custom: {
    pathname: string
    user: string | undefined
    proxyApi: string | undefined
  },
  ...base: Parameters<SWRInfiniteKeyLoader>
) => ReturnType<SWRInfiniteKeyLoader>

const getKey: InfiniteKeyLoader = (
  custom: {
    pathname: string
    user: string | undefined
    proxyApi: string | undefined
  },
  index: number,
  previousPageData: Transfers
) => {
  const { pathname, user, proxyApi } = custom
  if (!proxyApi) {
    console.debug('Environment variable NEXT_PUBLIC_API_BASE is undefined.')
    return null
  }

  // Reached the end
  if (previousPageData && previousPageData?.transfers?.length === 0) return null

  let query: paths['/transfers/v2']['get']['parameters']['query'] = {
    limit: 20,
    // offset: index * 20,
    // user,
  }

  const href = setParams(pathname, query)

  return href
}
