import { WyvernV2 } from '@reservoir0x/sdk'
import { Signer } from 'ethers'
import { paths } from 'interfaces/apiTypes'
import setParams from './params'

export default async function cancelOrder(
  apiBase: string,
  chainId: number,
  signer: Signer,
  query: paths['/orders/fill']['get']['parameters']['query']
) {
  try {
    // Get the order parameters from the Reservoir API
    const url = new URL('/orders/fill', apiBase)

    setParams(url, query)

    const res = await fetch(url.href)

    const { order } =
      (await res.json()) as paths['/orders/fill']['get']['responses']['200']['schema']

    if (!order?.params) {
      console.error('There was an error fetching the order to be cancelled.')
      return false
    }

    // Instantiate a Wyvern object from the order parameters
    // obatined from the API
    const sellOrder = new WyvernV2.Order(chainId, order.params)

    // Instantiate a Wyvern exchange object
    const exch = new WyvernV2.Exchange(chainId)

    // Execute cancellation
    const { wait } = await exch.cancel(signer, sellOrder)

    // Wait for transaction to be mined
    await wait()

    return true
  } catch (error) {
    console.log(error)
    return false
  }
}
