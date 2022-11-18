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
    Object.keys(query).forEach((key) => {
      const val = query[key]
      if (Array.isArray(val)) {
        searchParams.delete(key)
        val.forEach((el) => {
          searchParams.append(key, el)
        })
      }
    })
    return `${url}?${searchParams.toString()}`
  }
  console.log('query', query)
  Object.keys(query).map((key) => {
    if (Array.isArray(query[key])) {
      query[key].forEach((el: string) => {
        url.searchParams.append(key, el)
      })
    } else {
      url.searchParams.set(key, query[key]?.toString())
    }
  })
  return url.href
}
export default setParams
