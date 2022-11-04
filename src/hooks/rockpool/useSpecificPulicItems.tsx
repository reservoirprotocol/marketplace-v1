import { useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'
import { globalConfig } from '../../config'
import { SpecificPublicItemsData, SpecificPublicItemsVars, SPECIFIC_PUBLIC_ITEMS_QUERY } from '../../graphql/nftfy/rockpool/SpecificPublicItemsQuery'
import { RockpoolFilter } from '../../models/rockpool/SpecificPoolsTypes'


export const useSpecificPublicItems = (chainId: number, filters: RockpoolFilter, filterByCollectionAddress: string ) => {
  const [offset, setOffset] = useState<number>(0)
  const [hasMore, setHasMore] = useState<boolean>(true)

  const { loading, data, error, fetchMore } = useQuery<SpecificPublicItemsData, SpecificPublicItemsVars>(SPECIFIC_PUBLIC_ITEMS_QUERY, {
    variables: {
      chainId,
      limit: globalConfig.paginationLimit,
      filterBy: filters.type,
      offset,
      orderBy: filters.sortingField,
      orderDirection: filters.sortingDirection,
      filterByCollectionAddress
    }
  })

  const loadMore = async () => {
    if (hasMore && !loading) {
      const isLoaded = (data?.publicRockpoolItems.length || 0) - globalConfig.paginationLimit >= globalConfig.paginationLimit
      const newOffset = Number(offset) + globalConfig.paginationLimit
      try {
        const { data: nextPageData, error: nextPageError } = await fetchMore({
          variables: {
            offset: isLoaded ? data?.publicRockpoolItems.length || 0 : newOffset
          }
        })

        if (nextPageError) {
          console.error(nextPageError)
          return
        }

        setOffset(newOffset)
        setHasMore(nextPageData.publicRockpoolItems.length === globalConfig.paginationLimit)
      } catch (e) {
        console.error(e)
        return
      }
    }

    if (!data?.publicRockpoolItems.length) {
      setHasMore(false)
    }
  }
  useEffect(() => {
    setOffset(0)
    setHasMore(true)
  }, [chainId, filters])

  if (error) {
    console.error(error)
    return { rockpoolItems: [], loading, loadMore, hasMore }
  }

  return { specificPools: data?.publicRockpoolItems || [], loading, loadMore, hasMore }
}
