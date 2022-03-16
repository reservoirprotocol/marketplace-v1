import fetcher from 'lib/fetcher'
import useSWR from 'swr'

type OpenSeaResponse = {
  collection?: {
    banner_image_url?: string | undefined
  }
}

export default function useGetOpenSeaMetadata(
  collectionId: string | undefined
) {
  function getUrl() {
    if (!collectionId) return undefined

    const url = new URL(
      `/api/v1/collection/${collectionId}`,
      'https://api.opensea.io'
    )

    return url
  }

  const url = getUrl()

  const swr = useSWR<OpenSeaResponse>(url?.href, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
  })

  return swr
}
