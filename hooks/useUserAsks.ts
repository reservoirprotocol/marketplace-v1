import { useListings } from '@reservoir0x/reservoir-kit-ui'
import { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import useSearchCommunity from './useSearchCommunity'

const COMMUNITY = process.env.NEXT_PUBLIC_COMMUNITY
const COLLECTION = process.env.NEXT_PUBLIC_COLLECTION
const COLLECTION_SET_ID = process.env.NEXT_PUBLIC_COLLECTION_SET_ID

export default function useUserAsks(
  maker: string | undefined,
  collections: ReturnType<typeof useSearchCommunity>
) {
  const { ref, inView } = useInView()

  useEffect(() => {
    if (inView) {
      fetchNextPage()
    }
  }, [inView])

  const listingParams: Parameters<typeof useListings>['0'] = {
    maker,
  }

  if (COLLECTION && !COMMUNITY && !COLLECTION_SET_ID) {
    listingParams.contracts = [COLLECTION]
  } else if (COMMUNITY || COLLECTION_SET_ID) {
    const contracts =
      collections?.data?.collections
        ?.reduce((contracts, collection) => {
          if (collection.contract) {
            contracts.push(collection.contract)
          }
          return contracts
        }, [] as string[])
        .filter((contract) => typeof contract === 'string') || []

    if (contracts.length > 0) {
      listingParams.contracts = contracts
    }
  }

  const { data, mutate, fetchNextPage } = useListings(listingParams)

  return { data, mutate, ref }
}
