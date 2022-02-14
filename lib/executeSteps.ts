import { Signer } from 'ethers'
import { splitSignature } from 'ethers/lib/utils'
import setParams from './params'
import { pollApi, pollUntilComplete } from './pollApi'

export type Execute = {
  steps?:
    | {
        action: string
        description: string
        status: 'complete' | 'incomplete'
        kind: 'transaction' | 'signature' | 'request'
        data?: any
        loading?: boolean
      }[]
    | undefined
  error?: string | undefined
}

/**
 * When attempting to perform actions, such as, selling a token or
 * buying a token, the user's account needs to meet certain requirements. For
 * example, if the user attempts to buy a token the Reservoir API checks if the
 * user has enough balance, before providing the transaction to be signed by
 * the user. This function executes all transactions, in order, to complete the
 * action.
 * @param url URL object with the endpoint to be called. Example: `/execute/buy`
 * @param signer Ethereum signer object provided by the browser
 * @returns The data field of the last element in the steps array
 */
export default async function executeSteps(
  url: URL,
  signer: Signer,
  callback?: (steps: Execute) => any,
  newJson?: Execute
) {
  let json = newJson || {}

  if (!newJson) {
    const res = await fetch(url.href)

    json = await res.json()
  }

  if (json.error) throw new Error(json.error)

  if (!json.steps) throw new ReferenceError('There are no steps.')

  if (callback) callback(json)

  const firstIncomplete = json.steps.findIndex(
    ({ status }) => status === 'incomplete'
  )

  if (firstIncomplete === -1) return

  const { status, kind, data } = json.steps[firstIncomplete]

  // Execute all incomplete steps
  if (status === 'incomplete' && kind === 'transaction') {
    let transactionRequest = data

    // If the step is incomplete and there is no data, the API is
    // waiting for data from the previous step. Poll the same
    // endpoint with the same query and procced once the data is
    // returned
    if (!data) transactionRequest = await pollApi(url, firstIncomplete)

    const tx = await signer.sendTransaction(transactionRequest)

    await tx.wait()
  }

  if (status === 'incomplete' && kind === 'signature') {
    const signature = await signer.signMessage(data.message)

    const { r, s, v } = splitSignature(signature)

    setParams(url, { ...data.query, r, s, v })

    await fetch(url.href)
  }

  if (status === 'incomplete' && kind === 'request') {
    const postOrderUrl = new URL(data.endpoint, url.origin)
    await fetch(postOrderUrl.href, {
      method: data.method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data.body),
    })
  }

  const completed = await pollUntilComplete(url, firstIncomplete)

  executeSteps(url, signer, callback, completed)
}
