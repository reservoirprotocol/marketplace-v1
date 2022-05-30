import React from 'react'
import { useNetwork, useSigner } from 'wagmi'

const chainId = process.env.NEXT_PUBLIC_CHAIN_ID

function NetworkWarning() {
  const { activeChain } = useNetwork()
  const { data: signer } = useSigner()

  if (chainId && signer && activeChain?.id !== +chainId) {
    return (
      <div className="flex w-screen items-center justify-center bg-yellow-200 p-4 text-black">
        <span>
          You are connected to the wrong network. Please, switch to{' '}
          <strong>
            {+chainId === 1 ? 'Ethereum Mainnet' : 'Rinkeby Testnet'}
          </strong>
        </span>
      </div>
    )
  }
  return null
}

export default NetworkWarning
