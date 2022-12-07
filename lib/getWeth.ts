import { Provider } from '@ethersproject/abstract-provider'
import { BigNumber, Signer } from 'ethers'
import { addToConfig, Common } from '@0xlol/sdk'


const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID);
const usdc = process.env.NEXT_PUBLIC_USDC;
const wrappedNative = process.env.NEXT_PUBLIC_WRAPPED_NATIVE;
const router = process.env.NEXT_PUBLIC_ROUTER;
const seaportConduitController = process.env.NEXT_PUBLIC_SEAPORT_CONDUIT_CONTROLLER;
const seaportExchange = process.env.NEXT_PUBLIC_SEAPORT_EXCHANGE;

if (chainId && usdc && wrappedNative && router && seaportConduitController && seaportExchange) {
  addToConfig({
    chainId,
    usdc,
    wrappedNative,
    router,
    seaportConduitController,
    seaportExchange,
  });
}

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
