/**
 *  Set URL query params using a typed objects
 *
 * This will convert an object
 *
 * ```js
 *  {
 *    foo: 'bar',
 *    age: 50,
 *  }
 * ```
 *
 * into a query string
 *
 * `?foo=bar&age=50`
 *
 * and append it to URL provided
 *
 * `https://api.example.com/tokens?foo=bar&age=50`
 *
 * @param url An URL instance
 * @param query An object containing all needed query params.
 */
export default function setParams(url: URL, query: { [x: string]: any }) {
  Object.keys(query).map((key) =>
    url.searchParams.set(key, query[key]?.toString())
  )
  let t = {
    foo: 'bar',
    age: 50,
  }
}
