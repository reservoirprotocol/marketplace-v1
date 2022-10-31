import { useEffect, useState } from 'react'
import { allChains, Chain } from 'wagmi'

const chainId = process.env.NEXT_PUBLIC_CHAIN_ID

const allChainsIncludingAutobahn: Chain[] = allChains
  .concat([
    {
      id: 45_000,
      name: 'Autobahn Network',
      network: 'autobahn',
      nativeCurrency: {
        decimals: 18,
        name: 'TXL',
        symbol: 'TXL',
      },
      rpcUrls: {
        default: 'https://autobahn-rpc.com',
      },
      testnet: false,
      blockExplorers: {
        default: { name: 'Autobahn Explorer', url: 'https://autobahn-explorer.com' },
      },
    }
  ]);

export function findChain(id?: string) {
  if (id) {
    return allChainsIncludingAutobahn.find((x) => x.id === +id)
  }
  return undefined
}

export default function useEnvChain() {
  const [chain, setChain] = useState<Chain | undefined>()

  useEffect(() => {
    if (chainId) {
      setChain(findChain(chainId))
    }
  }, [])
  return chain
}
