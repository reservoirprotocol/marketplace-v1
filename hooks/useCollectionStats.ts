import { paths } from 'interfaces/apiTypes'
import setParams from 'lib/params'
import { NextRouter } from 'next/router'
import { useState, useEffect } from 'react'

export default function useCollectionStats(
  apiBase: string | undefined,
  router: NextRouter
) {
  const [stats, setStats] =
    useState<paths['/stats']['get']['responses']['200']['schema']>()

  const url = new URL('/stats', apiBase)

  useEffect(() => {
    async function getStats() {
      if (router.isReady) {
        const query: paths['/stats']['get']['parameters']['query'] = {
          collection: router.query?.id?.toString(),
        }

        setParams(url, query)

        const attributes = Object.keys(router.query).filter(
          (key) => key.startsWith('attributes[') && key.endsWith(']')
        )

        if (attributes.length > 0) {
          attributes.forEach((key) => {
            const value = router.query[key]?.toString()
            if (value) {
              url.searchParams.set(key, value)
            }
          })
        }

        const res = await fetch(url.href)
        const stats =
          (await res.json()) as paths['/stats']['get']['responses']['200']['schema']

        setStats(stats)
      }
    }
    getStats()
  }, [router])

  return stats
}
