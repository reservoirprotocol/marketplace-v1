import { useEffect, useState } from 'react'
import { Chain } from 'wagmi'
import * as allChains from 'wagmi/chains'

const chainId = process.env.NEXT_PUBLIC_CHAIN_ID

export function findChain(id?: string) {
  if (id) {
    return Object.values(allChains).find((chain) => chain.id === +id)
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
