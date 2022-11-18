import { paths } from '@reservoir0x/reservoir-kit-client'
import { useInView } from 'react-intersection-observer'
import { NextRouter } from 'next/router'
import { useEffect } from 'react'
import fetcher from 'lib/fetcher'
import setParams from 'lib/params'
import useSWRInfinite, { SWRInfiniteKeyLoader } from 'swr/infinite'
import { PROXY_API_BASE } from "./useCollections";
import { ContractMethodDoesNotExistError } from '@wagmi/core'

const RESERVOIR_API_BASE = process.env.NEXT_PUBLIC_RESERVOIR_API_BASE

type Collections = paths['/collections/v5']['get']['responses']['200']['schema']

export default function useCollectionsByContracts(router: NextRouter, contracts: string[], fallback?: Collections) {
    const { ref, inView } = useInView()

    const pathname = PROXY_API_BASE ? `${PROXY_API_BASE}/collections/v5` : new URL('/collections/v5', RESERVOIR_API_BASE)

    const sortBy = router.query['sort']?.toString()

    const collections = useSWRInfinite<Collections>(
        (index, previousPageData) =>
          getKey(pathname, sortBy, contracts, index, previousPageData),
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

export const getKey: (
    pathname: URL | string,
    sortBy: string | undefined,
    contracts: string[],
    ...base: Parameters<SWRInfiniteKeyLoader>
  ) => ReturnType<SWRInfiniteKeyLoader> = (
    pathname: URL | string,
    sortBy: string | undefined,
    contracts: string[],
    index: number,
    previousPageData: paths['/collections/v5']['get']['responses']['200']['schema']
  ) => {
    // Reached the end
    if (previousPageData && !previousPageData?.continuation) return null
  
    let query: paths['/collections/v5']['get']['parameters']['query'] = {
      limit: 20,
      sortBy: '1DayVolume',
      contract: contracts,
    }
  
    if (previousPageData) query.continuation = previousPageData.continuation
  
    if (sortBy === '30DayVolume' || sortBy === '7DayVolume') query.sortBy = sortBy
  
    const href = setParams(String(pathname), query)
  
    return href
  }