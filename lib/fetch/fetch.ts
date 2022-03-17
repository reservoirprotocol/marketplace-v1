import { paths } from 'interfaces/apiTypes'
import setParams from 'lib/params'
import { Dispatch } from 'react'

export async function getDetails(
  apiBase: string,
  contract: string | undefined,
  token: string | undefined,
  setDetails: Dispatch<any>
) {
  let url = new URL('/tokens/details/v1', apiBase)

  let query: paths['/tokens/details/v1']['get']['parameters']['query'] = {
    token: `${contract}:${token}`,
  }

  setParams(url, query)

  const res = await fetch(url.href)

  const json =
    (await res.json()) as paths['/tokens/details/v1']['get']['responses']['200']['schema']

  setDetails(json)
}

export async function getCollection(
  apiBase: string,
  collectionId: string | undefined,
  setCollection: Dispatch<any>
) {
  const url = new URL(`/collections/${collectionId}/v1`, apiBase)

  const res = await fetch(url.href)

  const json =
    (await res.json()) as paths['/collections/{collectionOrSlug}/v1']['get']['responses']['200']['schema']

  setCollection(json)
}
