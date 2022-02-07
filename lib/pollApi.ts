import { KeyedMutator } from 'swr'
import { URL } from 'url'

async function pollSwr(
  previousJson: any,
  mutate: KeyedMutator<{ [x: string]: any }>
) {
  const json = await mutate()

  // Check that the response from an endpoint updated
  if (JSON.stringify(previousJson) !== JSON.stringify(json)) {
    return true
  } else {
    // The response is still unchanged. Check again in five seconds
    await new Promise((resolve) => setTimeout(resolve, 5000))
    await pollSwr(json, mutate)
  }
}

async function pollApi(previousJson: any, url: URL) {
  const res = await fetch(url.href)

  const json = await res.json()

  // Check that the response from an endpoint updated
  if (JSON.stringify(previousJson) !== JSON.stringify(json)) {
    return json
  } else {
    // The response is still unchanged. Check again in five seconds
    await new Promise((resolve) => setTimeout(resolve, 5000))
    await pollApi(json, url)
  }
}

export { pollSwr, pollApi }
