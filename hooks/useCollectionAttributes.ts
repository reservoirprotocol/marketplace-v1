import { paths } from 'interfaces/apiTypes'
import fetcher from 'lib/fetcher'
import setParams from 'lib/params'
import { NextRouter } from 'next/router'
import { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import useSWRInfinite, { SWRInfiniteKeyLoader } from 'swr/infinite'

type Attributes =
  paths['/collections/{collection}/attributes']['get']['responses']['200']['schema']

export default function useCollectionAttributes(
  apiBase: string | undefined,
  router: NextRouter,
  collectionId: string
) {
  const { ref, inView } = useInView()

  const url = new URL(
    `/collections/${router.query.id || collectionId}/attributes`,
    apiBase
  )

  const collectionAttributes = useSWRInfinite<Attributes>(
    (index, previousPageData) => getKey(url, router, index, previousPageData),
    fetcher,
    {
      revalidateFirstPage: false,
    }
  )

  // Fetch more data when component is visible
  useEffect(() => {
    if (inView) {
      collectionAttributes.setSize(collectionAttributes.size + 1)
    }
  }, [inView])

  return { collectionAttributes, ref }
}

const getKey: (
  url: URL,
  router: NextRouter,
  ...base: Parameters<SWRInfiniteKeyLoader>
) => ReturnType<SWRInfiniteKeyLoader> = (
  url: URL,
  router: NextRouter,
  index: number,
  previousPageData: Attributes
) => {
  // Reached the end
  if (previousPageData && previousPageData?.attributes?.length === 0) {
    return null
  }

  let query: paths['/collections/{collection}/attributes']['get']['parameters']['query'] =
    { limit: 20, offset: index * 20 }

  // Convert the client sort query into the API sort query
  if (router.query?.sort) {
    if (`${router.query?.sort}` === 'best_offer') {
      query.sortBy = 'topBuyValue'
      query.sortDirection = 'desc'
    }

    if (`${router.query?.sort}` === 'name') {
      query.sortBy = 'value'
      query.sortDirection = 'asc'
    }
  } else {
    query.sortBy = 'floorSellValue'
    query.sortDirection = 'desc'
  }

  if (router.query.attribute_key) {
    query.attribute = router.query.attribute_key.toString()
  }

  setParams(url, query)

  return url.href
}
