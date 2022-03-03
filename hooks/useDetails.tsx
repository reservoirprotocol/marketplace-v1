import { paths } from 'interfaces/apiTypes'
import fetcher from 'lib/fetcher'
import setParams from 'lib/params'
import useSWR from 'swr'

export default function useDetails(
  apiBase: string | undefined,
  query: paths['/tokens/details']['get']['parameters']['query']
) {
  const url = new URL('/tokens/details', apiBase)

  setParams(url, query)

  const details = useSWR<
    paths['/tokens/details']['get']['responses']['200']['schema']
  >(url.href, fetcher)

  return details
}
