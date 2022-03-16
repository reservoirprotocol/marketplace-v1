import { paths } from 'interfaces/apiTypes'
import fetcher from 'lib/fetcher'
import setParams from 'lib/params'
import { NextRouter } from 'next/router'
import useSWR from 'swr'

export default function useCollectionStats(
  apiBase: string | undefined,
  router: NextRouter,
  collectionId: string | undefined
) {
  // useEffect(() => {
  //   stats.mutate()
  // }, [router.query])

  function getUrl() {
    if (!collectionId) return undefined

    const url = new URL('/stats/v1', apiBase)

    const query: paths['/stats/v1']['get']['parameters']['query'] = {
      collection: collectionId,
    }

    setParams(url, query)

    // Extract all queries of attribute type
    const attributes = Object.keys(router.query).filter(
      (key) =>
        key.startsWith('attributes[') &&
        key.endsWith(']') &&
        router.query[key] !== ''
    )

    // Add all selected attributes to the query
    if (attributes.length > 0) {
      attributes.forEach((key) => {
        const value = router.query[key]?.toString()
        if (value) {
          url.searchParams.set(key, value)
        }
      })
    }

    return url.href
  }

  const href = getUrl()

  const stats = useSWR<paths['/stats/v1']['get']['responses']['200']['schema']>(
    href,
    fetcher
  )

  return stats
}
