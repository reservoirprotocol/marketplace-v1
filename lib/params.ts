/**
 *  Set URL query params using a typed objects
 * @param url An URL instance
 * @param query An object containing all needed query params.
 */
export default function setParams(url: URL, query: { [x: string]: any }) {
  Object.keys(query).map((key) =>
    url.searchParams.set(key, query[key].toString())
  )
}
