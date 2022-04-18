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
 * and append it to an url pathname
 *
 * `/path/foo/bar/tokens?foo=bar&age=50`
 *
 * @param pathname A URL pathname
 * https://developer.mozilla.org/en-US/docs/Web/API/URL/pathname
 * @param query An object containing all needed query params.
 */
function setParams(pathname: string, query: { [x: string]: any }): string

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
function setParams(url: URL, query: { [x: string]: any }): string

function setParams(url: string | URL, query: { [x: string]: any }) {
  if (typeof url === 'string') {
    const searchParams = new URLSearchParams(query)
    return `${url}?${searchParams.toString()}`
  }
  Object.keys(query).map((key) =>
    url.searchParams.set(key, query[key]?.toString())
  )
  return url.href
}
export default setParams
