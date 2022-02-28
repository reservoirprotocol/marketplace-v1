import { paths } from 'interfaces/apiTypes'
import setParams from 'lib/params'
import { Dispatch } from 'react'

export async function getDetails(
  apiBase: string,
  contract: string | undefined,
  tokenId: string | undefined,
  setDetails: Dispatch<any>
) {
  let url = new URL('/tokens/details', apiBase)

  let query: paths['/tokens/details']['get']['parameters']['query'] = {
    contract,
    tokenId,
  }

  setParams(url, query)

  const res = await fetch(url.href)

  const json =
    (await res.json()) as paths['/tokens/details']['get']['responses']['200']['schema']

  setDetails(json)
}

export async function getCollection(
  apiBase: string,
  collectionId: string | undefined,
  setCollection: Dispatch<any>
) {
  const url = new URL(`/collections/${collectionId}`, apiBase)

  const res = await fetch(url.href)

  const json =
    (await res.json()) as paths['/collections/{collection}']['get']['responses']['200']['schema']

  setCollection(json)
}
