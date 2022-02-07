import { Signer } from 'ethers'
import { pollApi } from './pollApi'

type Execute = {
  steps?:
    | {
        action: string
        description: string
        status: 'complete' | 'incomplete'
        kind: 'transaction' | 'order-signature'
        data?: string | undefined
      }[]
    | undefined
  error?: string | undefined
}

export default async function checkCompleteness(url: URL, signer: Signer) {
  const res = await fetch(url.href)

  const json = (await res.json()) as Execute

  if (json.error) return false

  if (!json.steps) return false

  json.steps.forEach(async (step, index) => {
    if (step.status === 'incomplete' && !step?.data) {
      const polledData = (await pollApi(json, url)) as Execute
      const tx = await signer.sendTransaction(
        polledData.steps?.[index].data as any
      )

      await tx.wait()
    }

    if (step.status === 'incomplete' && step?.data) {
      const tx = await signer.sendTransaction(step.data as any)

      await tx.wait()
    }
  })
}
