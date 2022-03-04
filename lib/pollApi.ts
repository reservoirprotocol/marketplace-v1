import { URL } from 'url'

/**
 * Poll the URL with a 5 second interval until the step has data
 * available
 * @param url an URL object
 * @param index The index of the step to be polled for
 * @returns The updated JSON response
 */
async function pollUntilHasData(url: URL, index: number) {
  const res = await fetch(url.href)

  const json = await res.json()

  // Check if the data exists
  if (json?.steps?.[index]?.data) return json

  // The response is still unchanged. Check again in five seconds
  await new Promise((resolve) => setTimeout(resolve, 5000))
  await pollUntilHasData(url, index)
}

/**
 * Poll the URL with a 5 second interval until it responds with success
 * @param url An URL object
 * @returns When it has finished polling
 */
async function pollUntilOk(url: URL) {
  const res = await fetch(url.href)

  // Check that the response from an endpoint updated
  if (res.ok) {
    return
  } else {
    // The response is still unchanged. Check again in five seconds
    await new Promise((resolve) => setTimeout(resolve, 5000))
    await pollUntilOk(url)
  }
}

export { pollUntilHasData, pollUntilOk }
