import { useEffect, useState } from 'react'
import { allChains, Chain } from 'wagmi'

const chainId = process.env.NEXT_PUBLIC_CHAIN_ID

export default function useEnvChain() {
  const [chain, setChain] = useState<Chain | undefined>()
  useEffect(() => {
    if (chainId) {
      setChain(allChains.find((x) => x.id === +chainId))
    }
  }, [])
  return chain
}
