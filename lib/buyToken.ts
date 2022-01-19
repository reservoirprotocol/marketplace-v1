import { WyvernV2 } from '@reservoir0x/sdk'
import { Signer } from 'ethers'
import { paths } from 'interfaces/apiTypes'
import setParams from './params'

/**
 *
 * @param apiBase The Reservoir API base url
 * @param chainId The Ethereum chain ID (eg: 1 - Ethereum Mainnet, 4 - Rinkeby Testnet)
 * @param signer An Ethereum signer object
 * @param contract The contract address for the collection
 * @param tokenId The token ID
 * @returns `true` if the transaction was succesful, `fasle` otherwise
 */
async function instantBuy(
  apiBase: string,
  chainId: number,
  signer: Signer | undefined,
  contract: string | undefined,
  tokenId: string | undefined
) {
  try {
    if (!signer) {
      console.error('Cannot accept offer because the signer is undefined.')
      return
    }
    if (!tokenId) {
      console.error('Cannot accept offer because the token ID is undefined.')
      return
    }
    if (!contract) {
      console.error('Cannot accept offer because the contract is undefined.')
      return
    }

    // Fetch the best sell order for this token
    let url = new URL('/orders/fill', apiBase)

    let queries: paths['/orders/fill']['get']['parameters']['query'] = {
      contract,
      tokenId,
      side: 'sell',
    }

    setParams(url, queries)

    let res = await fetch(url.href)

    let { order } =
      (await res.json()) as paths['/orders/fill']['get']['responses']['200']['schema']

    if (!order?.params) {
      throw 'API ERROR: Could not retrieve order params'
    }

    // Build matching orders
    let sellOrder = new WyvernV2.Order(chainId, order.params)

    const buyOrder = sellOrder.buildMatching(
      await signer.getAddress(),
      order.buildMatchingArgs
    )

    let exch = new WyvernV2.Exchange(chainId)

    let { wait } = await exch.match(signer, buyOrder, sellOrder)

    // Wait for the transaction to be mined
    await wait()

    return true
  } catch (err) {
    console.error('Could not buy token', err)
    return false
  }
}

export { instantBuy }
