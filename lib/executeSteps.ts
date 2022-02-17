import { TypedDataSigner } from '@ethersproject/abstract-signer'
import { Signer } from 'ethers'
import { arrayify, splitSignature } from 'ethers/lib/utils'
import setParams from './params'
import { pollUntilChange, pollUntilHasData, pollUntilOk } from './pollApi'
import { Subject } from 'rxjs'

export type Execute = {
  steps?:
    | {
        action: string
        description: string
        status: 'complete' | 'incomplete'
        kind: 'transaction' | 'signature' | 'request' | 'confirmation'
        data?: any
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
 * @param setState Callback to update UI state has execution progresses
 * @returns The data field of the last element in the steps array
 */
export default async function executeSteps(
  url: URL,
  signer: Signer,
  json: Execute,
  observer: Subject<any>
) {
  // Update observer on first call or recursion
  observer.next(json.steps)

  // Handle errors
  if (json.error) throw new Error(json.error)
  if (!json.steps) throw new ReferenceError('There are no steps.')

  const incompleteIndex = json.steps.findIndex(
    ({ status }) => status === 'incomplete'
  )

  // There are no more incomplete steps
  if (incompleteIndex === -1) return json

  let { kind, data } = json.steps[incompleteIndex]

  // Append any extra params provided by API
  if (json.query) setParams(url, json.query)

  // If step is missing data, poll until it is ready
  if (!data) {
    json = (await pollUntilHasData(url, incompleteIndex)) as Execute
    if (!json.steps) throw new ReferenceError('There are no steps.')
    data = json.steps[incompleteIndex].data
  }

  // Handle each step based on it's kind
  switch (kind) {
    // Make an on-chain transaction
    case 'transaction': {
      const tx = await signer.sendTransaction(data)
      await tx.wait()
      break
    }

    // Sign a message
    case 'signature': {
      let signature: string | undefined

      // Request user signature
      if (data.signatureKind === 'eip191') {
        signature = await signer.signMessage(arrayify(data.message))
      } else if (data.signatureKind === 'eip712') {
        signature = await (signer as unknown as TypedDataSigner)._signTypedData(
          data.domain,
          data.types,
          data.value
        )
      }

      if (signature) {
        // Split signature into r,s,v components
        const { r, s, v } = splitSignature(signature)
        // Include signature params in any future requests
        setParams(url, { r, s, v })
      }

      break
    }

    // Post a signed order object to order book
    case 'request': {
      const postOrderUrl = new URL(data.endpoint, url.origin)
      try {
        await fetch(postOrderUrl.href, {
          method: data.method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data.body),
        })
      } catch (err) {
        throw err
      }
      break
    }

    // Confirm that an on-chain tx has been picked up by indexer
    case 'confirmation': {
      const confirmationUrl = new URL(data.endpoint, url.origin)
      await pollUntilOk(confirmationUrl)
      break
    }

    default:
      break
  }

  json.steps[incompleteIndex].status = 'complete'

  console.debug(
    'BEFORE RECURSION',
    json.steps?.map(({ status }) => status)
  )
  await executeSteps(url, signer, json, observer)
}
