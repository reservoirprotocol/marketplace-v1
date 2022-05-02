import { paths } from '@reservoir0x/client-sdk/dist/types/api'
import fetcher from 'lib/fetcher'
import setParams from 'lib/params'
import { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import useSWRInfinite, { SWRInfiniteKeyLoader } from 'swr/infinite'

const PROXY_API_BASE = process.env.NEXT_PUBLIC_PROXY_API_BASE

type Orders = paths['/orders/bids/v1']['get']['responses']['200']['schema']

export default function useUserBids(
  fallbackData: Orders[],
  user: string | undefined
) {
  const { ref, inView } = useInView()

  const pathname = `${PROXY_API_BASE}/orders/bids/v1`

  const orders = useSWRInfinite<Orders>(
    (index, previousPageData) =>
      getKey(
        { pathname, proxyApi: PROXY_API_BASE, user },
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
      orders.setSize(orders.size + 1)
    }
  }, [inView])

  return { orders, ref }
}

type InfiniteKeyLoader = (
  custom: {
    pathname: string
    proxyApi: string | undefined
    user: string | undefined
  },
  ...base: Parameters<SWRInfiniteKeyLoader>
) => ReturnType<SWRInfiniteKeyLoader>

const getKey: InfiniteKeyLoader = (
  custom: {
    pathname: string
    proxyApi: string | undefined
    user: string | undefined
  },
  index: number,
  previousPageData: Orders
) => {
  const { pathname, proxyApi, user } = custom
  if (!proxyApi) {
    console.debug(
      'Environment variable NEXT_PUBLIC_PROXY_API_BASE is undefined.'
    )
    return null
  }

  // Reached the end
  if (previousPageData && previousPageData?.orders?.length === 0) return null

  if (index !== 0 && previousPageData?.continuation === null) return null

  let query: paths['/orders/bids/v1']['get']['parameters']['query'] = {
    status: 'active',
    maker: user,
    limit: 20,
  }

  if (index !== 0) query.continuation = previousPageData.continuation

  const href = setParams(pathname, query)

  return href
}
