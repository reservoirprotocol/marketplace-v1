import { Provider } from '@ethersproject/abstract-provider'
import { BigNumber, Signer } from 'ethers'
import { Common } from '@reservoir0x/sdk'

/**
 * Get a wETH contract instance and the signers wETH balance
 * @param chainId The Ethereum chain ID (eg: 1 - Ethereum Mainnet,
 *  4 - Rinkeby Testnet, etc)
 * @param provider An abstraction to access the blockchain data
 * @param signer An Ethereum signer object
 * @returns A wETH contract instance and the signers wETH balance
 */
export default async function getWeth(
  chainId: ChainId,
  provider: Provider,
  signer: Signer
) {
  const weth = new Common.Helpers.Weth(provider, chainId)
  const signerAddress = await signer.getAddress()

  try {
    const balance = BigNumber.from(await weth.getBalance(signerAddress))
    return { weth, balance }
  } catch (err) {
    console.error(err)
  }

  return null
}
