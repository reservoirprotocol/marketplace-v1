import { paths } from 'interfaces/apiTypes'
import fetcher from 'lib/fetcher'
import useSWR from 'swr'

type Collection =
  paths['/collections/{collectionOrSlug}/v1']['get']['responses']['200']['schema']

export default function useCollection(
  apiBase: string | undefined,
  fallbackData: Collection | undefined,
  collectionId: string | undefined
) {
  const url = new URL(`/collections/${collectionId}/v1`, apiBase)

  const collection = useSWR<Collection>(url.href, fetcher, {
    fallbackData,
  })

  return collection
}
