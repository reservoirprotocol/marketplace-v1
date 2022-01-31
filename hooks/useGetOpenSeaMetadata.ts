import fetcher from 'lib/fetcher'
import useSWR from 'swr'

type OpenSeaResponse = {
  collection?: {
    banner_image_url?: string | undefined
  }
}

export default function useGetOpenSeaMetadata(collectionId: string) {
  const url = new URL(collectionId, 'https://api.opensea.io/api/v1/collection/')

  const swr = useSWR<OpenSeaResponse>(url.href, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
  })

  return swr
}
