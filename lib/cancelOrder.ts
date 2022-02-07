import { Signer } from 'ethers'
import { paths } from 'interfaces/apiTypes'
import checkCompleteness from './checkCompleteness'
import setParams from './params'
import { pollApi } from './pollApi'

export default async function cancelOrder(
  apiBase: string,
  chainId: ChainId,
  signer: Signer,
  query: paths['/execute/cancel']['get']['parameters']['query']
) {
  try {
    const url = new URL('/execute/cancel', apiBase)

    setParams(url, query)

    const result = await checkCompleteness(url, signer)

    // Get the order parameters from the Reservoir API
    // const url = new URL('/orders/fill', apiBase)

    // setParams(url, query)

    // const res = await fetch(url.href)

    // const { order } =
    //   (await res.json()) as paths['/orders/fill']['get']['responses']['200']['schema']

    // if (!order?.params) {
    //   console.error('There was an error fetching the order to be cancelled.')
    //   return false
    // }

    // Instantiate a Wyvern object from the order parameters
    // obatined from the API
    // const sellOrder = new WyvernV2.Order(chainId, order.params)

    // Instantiate a Wyvern exchange object
    // const exch = new WyvernV2.Exchange(chainId)

    // Execute cancellation
    // const { wait } = await exch.cancel(signer, sellOrder)

    // Wait for transaction to be mined
    // await wait()

    return true
  } catch (err) {
    console.log(err)
  }

  return false
}
