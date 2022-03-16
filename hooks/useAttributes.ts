import { paths } from 'interfaces/apiTypes'
import fetcher from 'lib/fetcher'
import setParams from 'lib/params'
import useSWR from 'swr'

export default function useAttributes(
  apiBase: string | undefined,
  collectionId: string | undefined
) {
  function getUrl() {
    if (!collectionId) return undefined

    const url = new URL('/attributes/v1', apiBase)

    const query: paths['/attributes/v1']['get']['parameters']['query'] = {
      collection: collectionId,
    }

    setParams(url, query)

    return url
  }

  const url = getUrl()

  const attributes = useSWR<
    paths['/attributes/v1']['get']['responses']['200']['schema']
  >(url?.href, fetcher)

  return attributes
}
