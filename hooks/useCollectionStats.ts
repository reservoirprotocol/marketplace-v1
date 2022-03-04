import { paths } from 'interfaces/apiTypes'
import fetcher from 'lib/fetcher'
import { NextRouter } from 'next/router'
import { useEffect } from 'react'
import useSWR from 'swr'

export default function useCollectionStats(
  apiBase: string | undefined,
  router: NextRouter,
  collectionId: string
) {
  useEffect(() => {
    stats.mutate()
  }, [router.query])

  function getUrl() {
    const url = new URL('/stats', apiBase)
    url.searchParams.set('collection', collectionId)

    const attributes = Object.keys(router.query).filter(
      (key) =>
        key.startsWith('attributes[') &&
        key.endsWith(']') &&
        router.query[key] !== ''
    )

    if (attributes.length > 0) {
      attributes.forEach((key) => {
        const value = router.query[key]?.toString()
        if (value) {
          url.searchParams.set(key, value)
        }
      })
    }

    return url
  }

  const stats = useSWR<paths['/stats']['get']['responses']['200']['schema']>(
    getUrl().href,
    fetcher
  )

  return stats
}
