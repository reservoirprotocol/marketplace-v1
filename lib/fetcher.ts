/**
 * swr's fetcher function. [Reference](https://swr.vercel.app/docs/data-fetching#fetch)
 * @param href An url to be fetched
 * @returns The API's response
 */
export default async function fetcher(href: string) {
  const res = await fetch(href)
  return res.json()
}
