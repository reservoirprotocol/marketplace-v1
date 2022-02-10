import { Signer } from 'ethers'
import { pollApi } from './pollApi'

type Execute = {
  steps?:
    | {
        action: string
        description: string
        status: 'complete' | 'incomplete'
        kind: 'transaction' | 'order-signature'
        data?: any
      }[]
    | undefined
  error?: string | undefined
}

export default async function checkCompleteness(
  url: URL,
  signer: Signer,
  index?: number
) {
  if (!index) index = 0

  const res = await fetch(url.href)

  const json = (await res.json()) as Execute

  if (json.error) throw new Error(json.error)

  if (!json.steps) throw new ReferenceError('There are no steps.')

  // Check that index is not greater than the length of steps
  if (json.steps.length - 1 >= index) {
    const { status, kind, data } = json.steps[index]
    if (status === 'incomplete' && kind !== 'order-signature') {
      if (data) {
        const tx = await signer.sendTransaction(data)

        await tx.wait()
      } else {
        const polledData = (await pollApi(json, url)) as Execute
        const tx = await signer.sendTransaction(polledData.steps?.[index].data)

        await tx.wait()
      }

      await checkCompleteness(url, signer, index + 1)
    }
  }

  return json.steps[json.steps.length - 1]?.data
}
