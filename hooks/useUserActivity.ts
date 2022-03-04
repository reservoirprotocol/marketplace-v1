import { paths } from 'interfaces/apiTypes'
import fetcher from 'lib/fetcher'
import setParams from 'lib/params'
import { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import useSWRInfinite, { SWRInfiniteKeyLoader } from 'swr/infinite'

type Transfers = paths['/transfers']['get']['responses']['200']['schema']

export default function useUserActivity(
  apiBase: string | undefined,
  fallbackData: Transfers[],
  user: string | undefined
) {
  const { ref, inView } = useInView()

  const url = new URL(`/transfers`, apiBase)

  const transfers = useSWRInfinite<Transfers>(
    (index, previousPageData) =>
      getKey({ url, user, apiBase }, index, previousPageData),
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
    url: URL
    user: string | undefined
    apiBase: string | undefined
  },
  ...base: Parameters<SWRInfiniteKeyLoader>
) => ReturnType<SWRInfiniteKeyLoader>

const getKey: InfiniteKeyLoader = (
  custom: {
    url: URL
    user: string | undefined
    apiBase: string | undefined
  },
  index: number,
  previousPageData: Transfers
) => {
  const { url, user, apiBase } = custom
  if (!apiBase) {
    console.debug('Environment variable NEXT_PUBLIC_API_BASE is undefined.')
    return null
  }

  // Reached the end
  if (previousPageData && previousPageData?.transfers?.length === 0) return null

  let query: paths['/transfers']['get']['parameters']['query'] = {
    limit: 20,
    offset: index * 20,
    user,
  }

  setParams(url, query)

  return url.href
}
