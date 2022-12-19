import useEnvChain from 'hooks/useEnvChain'
import React from 'react'
import { useNetwork, useSigner, useSwitchNetwork } from 'wagmi'

const chainId = process.env.NEXT_PUBLIC_CHAIN_ID

function CurrencyWarning() {
  const { chain: activeChain } = useNetwork()
  const { data: signer } = useSigner()
  const chain = useEnvChain()

  const chainName = `${chain?.name} ${chain?.testnet ? 'Testnet' : ''}`

  // All purchases are made in the native gas token TXL on the Autobahn Network, even if the frontend shows the Ethereum symbol. We are aware of it and will replace the ETH logo as soon as possible.

  if (chainId && signer && activeChain?.id === +chainId) {
    return (
      <div className="flex w-screen items-center justify-center gap-2 bg-[#FFA500] p-4 text-black">
        <span>MAINTENANCE: Currently we are working on a major update. During this update unexpected errors may occur.</span>
      </div>
    )
  }
  return null
}

export default CurrencyWarning
