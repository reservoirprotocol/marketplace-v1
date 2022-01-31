import useSWR from 'swr'
import { useEnsAvatar, useEnsLookup } from 'wagmi'

export default function useCacheEns(address: string, provider: Provider) {
  const [_, lookupAddress] = useEnsLookup({
    address,
  })
  await provider.lookupAddress('0x5555763613a12D8F3e73be831DFf8598089d3dCa')

  const { data: ens } = useSWR('get-ens', lookupAddress)

  const [__, getEnsAvatar] = useEnsAvatar({
    addressOrName: address,
  })

  const { data: avatar } = useSWR('get-avatar', getEnsAvatar)

  // example from swr docs: https://swr.vercel.app/docs/data-fetching#fetch
  return { ens: ens?.data, avatar }
}
