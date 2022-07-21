import { paths } from '@reservoir0x/reservoir-kit-client'
import fetcher from 'lib/fetcher'
import useSWR from 'swr'

const PROXY_API_BASE = process.env.NEXT_PUBLIC_PROXY_API_BASE

export default function useAttributes(collectionId: string | undefined) {
  function getUrl() {
    if (!collectionId) return undefined

    const pathname = `${PROXY_API_BASE}/collections/${collectionId}/attributes/all/v1`

    return pathname
  }

  const pathname = getUrl()

  const attributes = useSWR<
    paths['/collections/{collection}/attributes/all/v1']['get']['responses']['200']['schema']
  >(pathname, fetcher)

  return attributes
}
