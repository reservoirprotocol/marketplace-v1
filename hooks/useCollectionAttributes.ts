import { paths } from '@reservoir0x/reservoir-kit-client'
import fetcher from 'lib/fetcher'
import setParams from 'lib/params'
import { NextRouter } from 'next/router'
import { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import useSWRInfinite, { SWRInfiniteKeyLoader } from 'swr/infinite'

const PROXY_API_BASE = process.env.NEXT_PUBLIC_PROXY_API_BASE

type Attributes =
  paths['/collections/{collection}/attributes/explore/v3']['get']['responses']['200']['schema']

export default function useCollectionAttributes(
  router: NextRouter,
  collectionId: string | undefined
) {
  const { ref, inView } = useInView()

  function getUrl() {
    if (!collectionId) return undefined

    const pathname = `${PROXY_API_BASE}/collections/${
      router.query.id || collectionId
    }/attributes/explore/v3`

    return pathname
  }

  const pathname = getUrl()

  const collectionAttributes = useSWRInfinite<Attributes>(
    (index, previousPageData) =>
      getKey(pathname, router, index, previousPageData),
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
  pathname: string | undefined,
  router: NextRouter,
  ...base: Parameters<SWRInfiniteKeyLoader>
) => ReturnType<SWRInfiniteKeyLoader> = (
  pathname: string | undefined,
  router: NextRouter,
  index: number,
  previousPageData: Attributes
) => {
  // Reached the end
  if (previousPageData && previousPageData?.attributes?.length === 0) {
    return null
  }

  if (!pathname) return null

  let query: paths['/collections/{collection}/attributes/explore/v3']['get']['parameters']['query'] =
    { limit: 20, offset: index * 20, includeTopBid: true }

  // Convert the client sort query into the API sort query
  if (router.query?.sort) {
    if (`${router.query?.sort}` === 'best_offer') {
      query.sortBy = 'topBidValue'
    }

    // if (`${router.query?.sort}` === 'name') {
    //   query.sortBy = 'value'
    // }
  } else {
    query.sortBy = 'floorAskPrice'
  }

  if (router.query.attribute_key) {
    query.attributeKey = router.query.attribute_key.toString()
  }

  const href = setParams(pathname, query)

  return href
}
