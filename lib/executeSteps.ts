import { Signer } from 'ethers'
import { arrayify, splitSignature } from 'ethers/lib/utils'
import setParams from './params'
import { pollApi, pollUntilMsgSuccess } from './pollApi'

export type Execute = {
  steps?:
    | {
        action: string
        description: string
        status: 'complete' | 'incomplete'
        kind: 'transaction' | 'signature' | 'request' | 'confirmation'
        data?: any
        loading?: boolean
      }[]
    | undefined
  query?: { [x: string]: any }
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
  callback?: (steps: Execute) => any
) {
  const res = await fetch(url.href)

  const json = (await res.json()) as Execute

  if (json.error) throw new Error(json.error)

  if (!json.steps) throw new ReferenceError('There are no steps.')

  if (callback) callback(json)

  for (let index = 0; index < json.steps.length; index++) {
    let { status, kind, data } = json.steps[index]
    if (status === 'incomplete') {
      // If the step is incomplete and there is no data, the API is
      // waiting for data from the previous step. Poll the same
      // endpoint with the same query and procced once the data is
      // returned
      if (!data) data = await pollApi(url, index)

      switch (kind) {
        case 'confirmation': {
          const confirmationUrl = new URL(data.endpoint, url.origin)

          await pollUntilMsgSuccess(confirmationUrl)
        }

        case 'request': {
          const postOrderUrl = new URL(data.endpoint, url.origin)
          const order = await fetch(postOrderUrl.href, {
            method: data.method,
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data.body),
          })

          return order
        }

        case 'signature': {
          const signature = await signer.signMessage(arrayify(data.message))

          const { r, s, v } = splitSignature(signature)

          setParams(url, { ...json.query, r, s, v })

          await fetch(url.href)
        }

        case 'transaction': {
          const tx = await signer.sendTransaction(data)

          await tx.wait()
        }

        default:
          break
      }

      json.steps[index].status = 'complete'

      if (callback) callback(json)
    }
  }
}
