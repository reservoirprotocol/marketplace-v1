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

export default async function checkCompleteness(url: URL, signer: Signer) {
  const res = await fetch(url.href)

  const json = (await res.json()) as Execute

  if (json.error) throw new Error(json.error)

  if (!json.steps) throw new ReferenceError('There are no steps.')

  json.steps.forEach(async (step, index) => {
    if (step.kind !== 'order-signature') {
      if (step.status === 'incomplete' && !step?.data) {
        const polledData = (await pollApi(json, url)) as Execute
        const tx = await signer.sendTransaction(polledData.steps?.[index].data)

        await tx.wait()
      }

      if (step.status === 'incomplete' && step?.data) {
        const tx = await signer.sendTransaction(step.data)

        await tx.wait()
      }
    }
  })

  return json.steps[json.steps.length - 1].data
}
