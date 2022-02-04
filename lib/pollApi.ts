import { KeyedMutator } from 'swr'

export default async function longPoll(
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
    await longPoll(json, mutate)
  }
}
