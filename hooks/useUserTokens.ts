import { paths } from 'interfaces/apiTypes'
import fetcher from 'lib/fetcher'
import setParams from 'lib/params'
import { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import useSWRInfinite, { SWRInfiniteKeyLoader } from 'swr/infinite'

type Tokens = paths['/users/{user}/tokens']['get']['responses']['200']['schema']

export default function useUserTokens(
  apiBase: string | undefined,
  collectionId: string | undefined,
  fallbackData: Tokens[],
  mode: string | undefined,
  user: string | undefined
) {
  const { ref, inView } = useInView()

  const url = new URL(`/users/${user}/tokens`, apiBase)

  const tokens = useSWRInfinite<Tokens>(
    (index, previousPageData) =>
      getKey({ url, mode, collectionId, apiBase }, index, previousPageData),
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

type InfiniteKeyLoader = (
  custom: {
    url: URL
    collectionId: string | undefined
    mode: string | undefined
    apiBase: string | undefined
  },
  ...base: Parameters<SWRInfiniteKeyLoader>
) => ReturnType<SWRInfiniteKeyLoader>

const getKey: InfiniteKeyLoader = (
  custom: {
    url: URL
    collectionId: string | undefined
    mode: string | undefined
    apiBase: string | undefined
  },
  index: number,
  previousPageData: paths['/users/{user}/tokens']['get']['responses']['200']['schema']
) => {
  const { url, collectionId, mode, apiBase } = custom
  if (!apiBase) {
    console.debug('Environment variable NEXT_PUBLIC_API_BASE is undefined.')
    return null
  }

  // Reached the end
  if (previousPageData && previousPageData?.tokens?.length === 0) return null

  let query: paths['/users/{user}/tokens']['get']['parameters']['query'] = {
    limit: 20,
    offset: index * 20,
  }

  if (mode === 'community') {
    query.community = collectionId
  }

  if (mode === 'collection') {
    query.collection = collectionId
  }

  setParams(url, query)

  return url.href
}
