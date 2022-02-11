import { Execute } from './executeSteps'
import { pollApi } from './pollApi'

export default async function getOrderSignature(url: URL) {
  const res = await fetch(url.href)

  const json = (await res.json()) as Execute

  if (json.error) throw new Error(json.error)

  if (!json.steps) throw new ReferenceError('There are no steps.')

  const { data } = json.steps[json.steps.length - 1]

  if (data) return data

  const polledData = await pollApi(url, json.steps.length - 1)

  return polledData
}
