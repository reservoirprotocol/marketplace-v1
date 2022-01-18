import { Contract, ContractTransaction, ethers, Signer } from 'ethers'
import { paths } from 'interfaces/apiTypes'
import setParams from './params'
import { WyvernV2 } from '@reservoir0x/sdk'
import { Interface } from 'ethers/lib/utils'

/**
 *
 * @param collectionContract
 * @param proxyRegistryContract
 * @param signer
 * @param tokenId
 * @returns The user proxy
 */
async function registerUserProxy(
  collectionContract: Contract,
  proxyRegistryContract: Contract,
  signer: Signer,
  tokenId: string
) {
  try {
    // Make sure the signer is the owner of the listed token
    const owner = await collectionContract.connect(signer).ownerOf(tokenId)

    const signerAddress = await signer.getAddress()

    if (owner.toLowerCase() !== signerAddress.toLowerCase()) {
      console.error('Signer is not the token owner')
      return null
    }

    // Retrieve user proxy
    const userProxy = await proxyRegistryContract
      .connect(signer)
      .proxies(signerAddress)

    if (userProxy === ethers.constants.AddressZero) {
      // If the user has no associated proxy, then register one
      let { wait } = (await proxyRegistryContract
        .connect(signer)
        .registerProxy()) as ContractTransaction

      // Wait for the transaction to get mined
      await wait()

      // Retrieve user proxy
      const userProxy = await proxyRegistryContract
        .connect(signer)
        .proxies(signerAddress)

      return userProxy
    } else {
      // The user already registered a proxy
      return userProxy
    }
  } catch (error) {
    console.error('Could not check/register user proxy')
    return null
  }
}

// Check proxy aprroval
async function checkProxyApproval(
  collectionContract: Contract,
  signer: Signer,
  userProxy: any,
  tokenId: string
) {
  try {
    const signerAddress = await signer.getAddress()
    // Check approval on the user proxy
    let isApproved = await collectionContract
      .connect(signer)
      .isApprovedForAll(signerAddress, userProxy)

    if (!isApproved) {
      const approvedAddress = await collectionContract
        .connect(signer)
        .getApproved(tokenId)
      isApproved = approvedAddress.toLowerCase() === signerAddress.toLowerCase()
    }

    if (isApproved) {
      // Set success
      return true
    } else {
      // Set the approval on the user proxy
      const { wait } = (await collectionContract
        .connect(signer)
        .setApprovalForAll(userProxy, true)) as ContractTransaction

      // Wait for the transaction to get mined
      await wait()

      return true
    }
  } catch (error) {
    console.error('Could not check/set approval')
    return false
  }
}

async function getMatchingOrders(
  API_BASE: string,
  CHAIN_ID: number,
  signer: Signer,
  tokenId: string,
  contract: string
) {
  try {
    // Get the best offer for the token
    let url = new URL('/orders/fill', API_BASE)

    let queries: paths['/orders/fill']['get']['parameters']['query'] = {
      contract,
      tokenId,
      side: 'buy',
    }

    setParams(url, queries)

    // Get the best BUY order data
    let res = await fetch(url.href)

    let { order } =
      (await res.json()) as paths['/orders/fill']['get']['responses']['200']['schema']

    if (!order?.params) {
      throw 'API ERROR: Could not retrieve order params'
    }

    // Use SDK to create order object
    let buyOrder = new WyvernV2.Order(CHAIN_ID, order?.params)

    // Instatiate an matching SELL Order
    let sellOrder = buyOrder.buildMatching(
      await signer.getAddress(),
      order.buildMatchingArgs
    )

    return { buyOrder, sellOrder }
  } catch (error) {
    console.error('Could not fill order', error)
    return null
  }
}

async function isProxyApproved(
  signer: Signer,
  tokenId: string,
  contract: string
) {
  const collectionContract = new Contract(
    contract,
    new Interface([
      'function ownerOf(uint256 tokenId) view returns (address)',
      'function getApproved(uint256 tokenId) view returns (address)',
      'function isApprovedForAll(address owner, address operator) view returns (bool)',
      'function setApprovalForAll(address operator, bool approved)',
    ])
  )

  const proxyRegistryContract = new Contract(
    process.env.NEXT_PUBLIC_CHAIN_ID === '4'
      ? '0xf57b2c51ded3a29e6891aba85459d600256cf317'
      : '0xa5409ec958c83c3f309868babaca7c86dcb077c1',
    new Interface([
      'function proxies(address) view returns (address)',
      'function registerProxy()',
    ])
  )

  try {
    const userProxy = await registerUserProxy(
      collectionContract,
      proxyRegistryContract,
      signer,
      tokenId
    )
    const proxyApproved = await checkProxyApproval(
      collectionContract,
      signer,
      userProxy,
      tokenId
    )
    return proxyApproved
  } catch (error) {
    console.error('Could not fill order', error)
    return false
  }
}

/**
 *
 * @param API_BASE The Reservoir API base url
 * @param CHAIN_ID The Ethereum chain ID (eg: 1 - Ethereum Mainnet, 4 - Rinkeby Testnet)
 * @param signer An Ethereum signer object
 * @param contract The contract address for the collection
 * @param tokenId The token ID
 * @returns `true` if the transaction was succesful, `fasle` otherwise
 */
async function acceptOffer(
  API_BASE: string,
  CHAIN_ID: number,
  signer: Signer | undefined,
  tokenId: string | undefined,
  contract: string | undefined
) {
  if (!signer) {
    console.error('The signer is undefined.')
    return
  }
  if (!tokenId) {
    console.error('The token ID is undefined.')
    return
  }
  if (!contract) {
    console.error('The contract address is undefined.')
    return
  }

  try {
    const proxyApproved = await isProxyApproved(signer, tokenId, contract)

    if (proxyApproved) {
      const orders = await getMatchingOrders(
        API_BASE,
        CHAIN_ID,
        signer,
        tokenId,
        contract
      )
      if (orders) {
        const { buyOrder, sellOrder } = orders
        // Instantiate WyvernV2 Exchange contract object
        const exchange = new WyvernV2.Exchange(CHAIN_ID)

        // Execute token sell
        let { wait } = await exchange.match(signer, buyOrder, sellOrder)

        // Wait for transaction to be mined
        await wait()

        return true
      }
      return false
    }
    return false
  } catch (error) {
    console.error('Could not fill order', error)
    return false
  }
}

async function listTokenForSell(
  API_BASE: string,
  CHAIN_ID: number,
  signer: Signer | undefined,
  query: paths['/orders/build']['get']['parameters']['query']
) {
  if (!signer) {
    console.error('The signer is undefined.')
    return
  }
  if (!query.tokenId) {
    console.error('The token ID is undefined.')
    return
  }
  if (!query.contract) {
    console.error('The contract address is undefined.')
    return
  }

  try {
    const proxyApproved = await isProxyApproved(
      signer,
      query.tokenId,
      query.contract
    )

    if (proxyApproved) {
      // Build a selling order
      let url = new URL(`${process.env.NEXT_PUBLIC_API_BASE}/orders/build`)

      //   let queries: paths['/orders/build']['get']['parameters']['query'] = {
      //     contract,
      //     maker: await signer.getAddress(),
      //     side: 'sell',
      //     price: ethers.utils.parseEther(`${listingPrice}`).toString(),
      //     fee: `${collection.royalties?.bps}`,
      //     feeRecipient:
      //       collection.royalties?.recipient || (await signer.getAddress()),
      //     tokenId,
      //   }

      setParams(url, query)

      let res = await fetch(url.href)

      let { order } =
        (await res.json()) as paths['/orders/build']['get']['responses']['200']['schema']

      if (!order?.params) {
        throw 'API ERROR: Could not retrieve order params'
      }

      // Use SDK to create order object
      const sellOrder = new WyvernV2.Order(CHAIN_ID, order.params)

      // Sign selling order
      await sellOrder.sign(signer)

      // Post order to the database
      let url2 = new URL('/orders', API_BASE)

      await fetch(url2.href, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orders: [
            {
              kind: 'wyvern-v2',
              data: sellOrder.params,
            },
          ],
        }),
      })

      return true
    }

    return false
  } catch (error) {
    console.error(error)
    return false
  }
}

export {
  registerUserProxy,
  checkProxyApproval,
  getMatchingOrders,
  acceptOffer,
  listTokenForSell,
}
