import { useEffect, useState } from 'react'
import { allChains, Chain } from 'wagmi'

const chainId = process.env.NEXT_PUBLIC_CHAIN_ID

export function findChain(id?: string) {
  if (id) {
    return allChains.find((x) => x.id === +id)
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
