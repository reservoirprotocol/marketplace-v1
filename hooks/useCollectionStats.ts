import { paths } from '@reservoir0x/reservoir-kit-client'
import fetcher from 'lib/fetcher'
import setParams from 'lib/params'
import { NextRouter } from 'next/router'
import useSWR from 'swr'

const PROXY_API_BASE = process.env.NEXT_PUBLIC_PROXY_API_BASE

export default function useCollectionStats(
  router: NextRouter,
  collectionId: string | undefined
) {
  function getUrl() {
    if (!collectionId) return undefined

    const pathname = `${PROXY_API_BASE}/stats/v2`

    const query: paths['/stats/v2']['get']['parameters']['query'] = {
      collection: collectionId,
      normalizeRoyalties: true
    }

    // Extract all queries of attribute type
    const attributes = Object.keys(router.query).filter(
      (key) =>
        key.startsWith('attributes[') &&
        key.endsWith(']') &&
        router.query[key] !== ''
    )

    const query2: { [key: string]: any } = {}

    // Add all selected attributes to the query
    if (attributes.length > 0) {
      attributes.forEach((key) => {
        const value = router.query[key]?.toString()
        if (value) {
          query2[key] = value
        }
      })
    }

    const href = setParams(pathname, { ...query, ...query2 })

    return href
  }

  const href = getUrl()

  const stats = useSWR<paths['/stats/v2']['get']['responses']['200']['schema']>(
    href,
    fetcher
  )

  return stats
}
