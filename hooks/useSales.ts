import { paths } from '@reservoir0x/reservoir-kit-client'
import fetcher from 'lib/fetcher'
import setParams from 'lib/params'
import useSWRInfinite, { SWRInfiniteKeyLoader } from 'swr/infinite'
import { useInView } from 'react-intersection-observer'
import { useEffect } from 'react'

const PROXY_API_BASE = process.env.NEXT_PUBLIC_PROXY_API_BASE

type SalesGetRequest = paths['/sales/v4']['get']
type SalesData = SalesGetRequest['responses']['200']['schema']

const getKey: (
  pathname: string,
  collectionId: string,
  ...base: Parameters<SWRInfiniteKeyLoader>
) => ReturnType<SWRInfiniteKeyLoader> = (
  pathname: string,
  collectionId: string,
  index: number,
  previousPageData?: SalesData
) => {
  if (
    previousPageData &&
    (previousPageData.sales?.length === 0 || !previousPageData.continuation)
  )
    return null

  if (!PROXY_API_BASE) {
    console.debug(
      'Environment variable NEXT_PUBLIC_PROXY_API_BASE is undefined.'
    )
    return null
  }

  let query: SalesGetRequest['parameters']['query'] = {
    limit: 20,
    collection: collectionId || '',
    includeTokenMetadata: true,
  }

  if (
    index !== 0 &&
    previousPageData &&
    previousPageData.continuation !== null
  ) {
    query.continuation = previousPageData.continuation
  }

  return setParams(pathname, query)
}

export default function useSales(collectionId?: string | undefined) {
  const pathname = `${PROXY_API_BASE}/sales/v4`

  const { ref, inView } = useInView()

  const sales = useSWRInfinite<SalesData>(
    (index, previousPageData) =>
      getKey(pathname, collectionId || '', index, previousPageData),
    fetcher,
    {
      revalidateFirstPage: false,
    }
  )

  useEffect(() => {
    if (inView && !sales.isValidating) {
      sales.setSize(sales.size + 1)
    }
  }, [inView])

  return { sales, ref }
}
