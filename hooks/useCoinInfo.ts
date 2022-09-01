import fetcher from 'lib/fetcher'
import useSWRImmutable from 'swr/immutable'

const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID || '1'

const supportedChains: Record<number, string> = {
  1: 'ethereum',
  10: 'optimistic-ethereum',
  137: 'polygon-pos',
}

export default function useCoinInfo(address: string) {
  const chainName = supportedChains[+CHAIN_ID]
    ? supportedChains[+CHAIN_ID]
    : supportedChains[1]
  const url = `https://api.coingecko.com/api/v3/coins/${chainName}/contract/${address}`
  const data = useSWRImmutable(address ? url : null, fetcher)

  return data
}
