import { paths } from '@reservoir0x/client-sdk'
import fetcher from 'lib/fetcher'
import useSWR from 'swr'

export default function useAttributes(
  apiBase: string | undefined,
  collectionId: string | undefined
) {
  function getUrl() {
    if (!collectionId) return undefined

    const url = new URL(
      `/collections/${collectionId}/attributes/all/v1`,
      apiBase
    )

    return url
  }

  const url = getUrl()

  const attributes = useSWR<
    paths['/collections/{collection}/attributes/all/v1']['get']['responses']['200']['schema']
  >(url?.href, fetcher)

  return attributes
}
