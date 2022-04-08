import { paths } from '@reservoir0x/client-sdk'
import fetcher from 'lib/fetcher'
import setParams from 'lib/params'
import useSWR from 'swr'

type Collection = paths['/collection/v1']['get']['responses']['200']['schema']

export default function useCollection(
  apiBase: string | undefined,
  fallbackData: Collection | undefined,
  collectionId: string | undefined
) {
  function getUrl() {
    if (!collectionId) return undefined

    const url = new URL('/collection/v1', apiBase)

    let query: paths['/collection/v1']['get']['parameters']['query'] = {
      id: collectionId,
    }

    setParams(url, query)

    return url.href
  }

  const href = getUrl()

  const collection = useSWR<Collection>(href, fetcher, {
    fallbackData,
  })

  return collection
}
