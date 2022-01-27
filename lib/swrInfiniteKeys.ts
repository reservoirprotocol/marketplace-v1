import { paths } from 'interfaces/apiTypes'
import { NextRouter } from 'next/router'
import { SWRInfiniteKeyLoader } from 'swr/infinite/dist/infinite'
import setParams from './params'

const getTokensKey: (
  url: URL,
  collection: string | undefined,
  router: NextRouter,
  ...base: Parameters<SWRInfiniteKeyLoader>
) => ReturnType<SWRInfiniteKeyLoader> = (
  url: URL,
  collection: string | undefined,
  router: NextRouter,
  index: number,
  previousPageData: paths['/tokens']['get']['responses']['200']['schema']
) => {
  if (!collection) {
    console.debug('Data is missing.', {
      collection,
    })
    return null
  }

  // Reached the end
  if (previousPageData && previousPageData?.tokens?.length === 0) return null

  let query: paths['/tokens']['get']['parameters']['query'] = {
    limit: 20,
    offset: index * 20,
    collection,
  }

  // Convert the client sort query into the API sort query
  if (router.query?.sort) {
    if (`${router.query?.sort}` === 'highest_offer') {
      query.sortBy = 'topBuyValue'
      query.sortDirection = 'desc'
    }

    if (`${router.query?.sort}` === 'token_id') {
      query.sortBy = 'tokenId'
      query.sortDirection = 'asc'
    }
  } else {
    query.sortBy = 'floorSellValue'
    query.sortDirection = 'asc'
  }

  Object.keys(router.query).forEach((key) => {
    key.startsWith('attributes[') &&
      key.endsWith(']') &&
      router.query[key] !== '' &&
      url.searchParams.set(key, `${router.query[key]}`)
  })

  setParams(url, query)

  return url.href
}

export { getTokensKey }
