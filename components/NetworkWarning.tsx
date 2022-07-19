import useEnvChain from 'hooks/useEnvChain'
import React from 'react'
import { useNetwork, useSigner } from 'wagmi'

const chainId = process.env.NEXT_PUBLIC_CHAIN_ID

function NetworkWarning() {
  const { chain: activeChain } = useNetwork()
  const { data: signer } = useSigner()
  const chain = useEnvChain()

  const chainName = `${chain?.name} ${chain?.testnet ? 'Testnet' : ''}`

  if (chainId && signer && activeChain?.id !== +chainId) {
    return (
      <div className="flex w-screen items-center justify-center bg-yellow-200 p-4 text-black">
        <span>
          You are connected to the wrong network. Please, switch to{' '}
          <strong>{+chainId === 1 ? 'Ethereum Mainnet' : chainName}</strong>
        </span>
      </div>
    )
  }
  return null
}

export default NetworkWarning
