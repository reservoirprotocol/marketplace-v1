import { paths } from '@reservoir0x/client-sdk'
import setParams from 'lib/params'
import { Dispatch } from 'react'

export async function getDetails(
  apiBase: string,
  contract: string | undefined,
  token: string | undefined,
  setDetails: Dispatch<any>
) {
  let url = new URL('/tokens/details/v2', apiBase)

  let query: paths['/tokens/details/v2']['get']['parameters']['query'] = {
    token: `${contract}:${token}`,
  }

  setParams(url, query)

  const res = await fetch(url.href)

  const json =
    (await res.json()) as paths['/tokens/details/v2']['get']['responses']['200']['schema']

  setDetails(json)
}

export async function getCollection(
  apiBase: string,
  collectionId: string | undefined,
  setCollection: Dispatch<any>
) {
  const url = new URL('/collection/v1', apiBase)

  let query: paths['/collection/v1']['get']['parameters']['query'] = {
    id: collectionId,
  }

  setParams(url, query)

  const res = await fetch(url.href)

  const json =
    (await res.json()) as paths['/collection/v1']['get']['responses']['200']['schema']

  setCollection(json)
}
