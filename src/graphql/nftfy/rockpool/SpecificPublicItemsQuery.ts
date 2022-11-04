import { gql } from '@apollo/client'
import {
  OrderDirection,
  SpecificPoolItem,
  SpecificPoolItemFilter,
  SpecificPoolItemOrderBy
} from '../../../models/rockpool/SpecificPoolsTypes'

export interface SpecificPublicItemsVars {
  chainId: number
  filterBy: SpecificPoolItemFilter
  orderBy: SpecificPoolItemOrderBy
  orderDirection: OrderDirection
  limit: number
  offset: number
  filterByCollectionAddress: string
}
export interface SpecificPublicItemsData {
  publicRockpoolItems: SpecificPoolItem[]
}

export const SPECIFIC_PUBLIC_ITEMS_QUERY = gql`
  query PublicRockpoolItems(
    $chainId: Int!
    $limit: Int!
    $offset: Int!
    $filterBy: RockpoolItemFilter!
    $orderBy: RockpoolItemOrderBy!
    $orderDirection: OrderDirection!
    $filterByCollectionAddress: String
  ) {
    publicRockpoolItems(
      chainId: $chainId
      limit: $limit
      offset: $offset
      filterBy: $filterBy
      orderBy: $orderBy
      orderDirection: $orderDirection
      filterByCollectionAddress: $filterByCollectionAddress
    ) {
      amount
      description
      name
      target {
        metadata {
          description
          image
          animationType
          animation_url
          asset_contract {
            name
            schema_name
          }
          attributes {
            value
            trait_type
          }
          author
          discord
          imageFull
          instagram
          name
          owner
          properties {
            total_supply {
              type
              description
            }
            preview_media_file_type2 {
              type
              description
            }
            preview_media_file_type {
              type
              description
            }
            preview_media_file2_type {
              type
              description
            }
            preview_media_file2 {
              type
              description
            }
            preview_media_file {
              type
              description
            }
            name {
              type
              description
            }
            description {
              type
              description
            }
            created_at {
              type
              description
            }
          }
          social_media
          telegram
          totalSupply
          twitter
          web_site_url
        }
        tokenURI
        tokenId
        id
        contract_type
        collection {
          symbol
          name
          id
        }
        chainId
        boxItemCount
      }
      targetPrice
      symbol
      status
      sellerNetAmount
      sellerFeeAmount
      seller
      reservePrice
      priceMultiplier
      poolProgress
      paymentToken {
        symbol
        name
        id
        decimals
      }
      chainId
      buyersCount
      creator
      creatorFee
      fractionsCount
      fractions
      id
      isErc721Available
      lastBuyers {
        amount
        buyer
        fractionsCount
        id
        ownership
      }
      fee
      listed
      targetPriceNet
      timestamp
    }
  }
`
