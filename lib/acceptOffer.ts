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
      throw new Error('The signer is not the token owner.')
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
  } catch (err) {
    console.error(err)
  }
  return null
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

    if (!isApproved) {
      // Set the approval on the user proxy
      const { wait } = (await collectionContract
        .connect(signer)
        .setApprovalForAll(userProxy, true)) as ContractTransaction

      // Wait for the transaction to get mined
      await wait()
    }

    // Everything has executed successfully
    return true
  } catch (err) {
    console.error(err)
  }
  return false
}

async function getMatchingOrders(
  apiBase: string,
  chainId: ChainId,
  signer: Signer,
  query: paths['/orders/fill']['get']['parameters']['query']
) {
  try {
    // Get the best offer for the token
    const url = new URL('/orders/fill', apiBase)

    setParams(url, query)

    // Get the best BUY order data
    const res = await fetch(url.href)

    const { order } =
      (await res.json()) as paths['/orders/fill']['get']['responses']['200']['schema']

    if (!order?.params) {
      throw new ReferenceError('Could not retrieve order params from the API')
    }

    // Use SDK to create order object
    const buyOrder = new WyvernV2.Order(chainId, order?.params)

    const signerAddress = await signer.getAddress()

    // Instatiate an matching SELL Order
    const sellOrder = buyOrder.buildMatching(
      signerAddress,
      order.buildMatchingArgs
    )

    return { buyOrder, sellOrder }
  } catch (err) {
    console.error(err)
  }
  return null
}

async function isProxyApproved(
  chainId: ChainId,
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
    chainId === 4
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
  } catch (err) {
    console.error(err)
  }
  return false
}

/**
 *
 * @param apiBase The Reservoir API base url
 * @param chainId The Ethereum chain ID (eg: 1 - Ethereum Mainnet, 4 - Rinkeby Testnet)
 * @param signer An Ethereum signer object
 * @param contract The contract address for the collection
 * @param tokenId The token ID
 * @returns `true` if the transaction was succesful, `fasle` otherwise
 */
async function acceptOffer(
  apiBase: string,
  chainId: ChainId,
  signer: Signer,
  query: paths['/orders/fill']['get']['parameters']['query']
) {
  try {
    const proxyApproved = await isProxyApproved(
      chainId,
      signer,
      query.tokenId,
      query.contract
    )

    if (!proxyApproved) return false

    const orders = await getMatchingOrders(apiBase, chainId, signer, query)

    if (!orders) return false

    const { buyOrder, sellOrder } = orders
    // Instantiate WyvernV2 Exchange contract object
    const exchange = new WyvernV2.Exchange(chainId)

    // Execute token sell
    let { wait } = await exchange.match(signer, buyOrder, sellOrder)

    // Wait for transaction to be mined
    await wait()

    return true
  } catch (err) {
    console.error(err)
  }
  return false
}

/**
 * List a token for sell.
 * 1. Verify that the user has approved the Wyvern Proxy contract
 * 2. Build an order using the Reservoir API and the Reservoir SDK
 * 3. POST the order the Reservoir API
 * @param apiBase The Reservoir base API
 * @param chainId The Ethereum network id
 * @param signer The signer object created upon wallet connection
 * @param query The API query with the order parameters
 * @returns `true` if the order was successfully submitted, `false`
 * otherwise
 */
async function listTokenForSale(
  apiBase: string,
  chainId: ChainId,
  signer: Signer,
  query: Overwrite<
    paths['/orders/build']['get']['parameters']['query'],
    { tokenId: string; contract: string }
  >
) {
  try {
    const proxyApproved = await isProxyApproved(
      chainId,
      signer,
      query.tokenId,
      query.contract
    )

    if (!proxyApproved) return false

    // Build a selling order
    let url = new URL('/orders/build', apiBase)

    setParams(url, query)

    let res = await fetch(url.href)

    let { order } =
      (await res.json()) as paths['/orders/build']['get']['responses']['200']['schema']

    if (!order?.params) {
      throw new ReferenceError('Could not retrieve order params.')
    }

    // Use SDK to create order object
    const sellOrder = new WyvernV2.Order(chainId, order.params)

    // Sign selling order
    await sellOrder.sign(signer)

    // Post order to the database
    let url2 = new URL('/orders', apiBase)

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
  } catch (error) {
    console.error(error)
  }

  return false
}

export {
  registerUserProxy,
  checkProxyApproval,
  getMatchingOrders,
  acceptOffer,
  listTokenForSale,
}
