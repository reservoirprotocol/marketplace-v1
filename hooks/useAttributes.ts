import { paths } from 'interfaces/apiTypes'
import fetcher from 'lib/fetcher'
import setParams from 'lib/params'
import useSWR from 'swr'

export default function useAttributes(
  apiBase: string | undefined,
  collectionId: string | undefined
) {
  const url = new URL('/attributes', apiBase)

  const query: paths['/attributes']['get']['parameters']['query'] = {
    collection: collectionId || '',
  }

  setParams(url, query)

  const attributes = useSWR<
    paths['/attributes']['get']['responses']['200']['schema']
  >(url.href, fetcher)

  return attributes
}
