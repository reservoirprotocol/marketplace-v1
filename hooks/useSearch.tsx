import { paths } from 'interfaces/apiTypes'
import fetcher from 'lib/fetcher'
import setParams from 'lib/params'
import useSWR from 'swr'

type Collections = paths['/collections']['get']['responses']['200']['schema']

export default function useSearchCollections(apiBase: string | undefined) {
  const url = new URL('/collections', apiBase)

  const query: paths['/collections']['get']['parameters']['query'] = {
    sortBy: 'floorCap',
    sortDirection: 'desc',
  }

  setParams(url, query)

  const collections = useSWR<Collections>(url.href, fetcher, {
    revalidateOnFocus: false,
  })

  return collections
}
