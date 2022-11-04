import { makeVar } from '@apollo/client'
import { Collection } from './Collection'
import { Metadata } from './Erc721Item'
import { PaymentToken } from './PaymentToken'

export interface Erc721CollectionStats {
  itemsCount?: number
  ownersCount?: number
  floorPrice?: number
  volumeTraded?: number
}

export interface Erc721Collection {
  chainId: number
  collectionAddress: string
  slug: string
  verified: boolean
  creator?: string
  collectionName?: string
  description?: string
  website?: string
  discord?: string
  instagram?: string
  telegram?: string
  twitter?: string
  image_url?: string
  banner_url?: string
  stats?: Erc721CollectionStats
}
export interface TargetRockpool {
  boxItemCount: number
  chainId: number
  collection: Collection
  id: string
  tokenId: string
  metadata: Metadata
}

export interface SpecificBuyer {
  amount: string
  buyer: string
  fractionsCount: string
  id: string
  ownership: string
}

export enum RockpoolStatus {
  CREATED = 'CREATED',
  ACQUIRED = 'ACQUIRED',
  ENDED = 'ENDED'
}

export interface Erc721Rockpool {
  boxItemCount: number
  chainId: number
  url: string
  price: string
  collection: Collection
  tokenId: string
  metadata: Metadata
}

export interface SpecificPoolItem {
  amount: string
  chainId: number
  buyersCount: number
  creatorFee: string
  creator: string
  description: string
  fee: string
  fractions: string | null
  fractionsCount: number
  id: string
  lastBuyers: SpecificBuyer[]
  listed: boolean
  name: string
  paymentToken: PaymentToken
  poolProgress: string
  priceMultiplier: string
  reservePrice: string
  seller: string
  sellerFeeAmount?: string
  sellerNetAmount?: string
  status: RockpoolStatus
  symbol: string
  target: TargetRockpool
  targetPrice: string
  targetPriceNet: string
  timestamp?: string
  isErc721Available: boolean
}

export interface ClaimableRockpoolFractions {
  buyer: string
  amount: string
  fractionsCount: string
  ownership: string
  collectionAddress: string
  collectionName: string
  fractions: string
  tokenId: string
  imageUrl: string
  targetPrice: string
  buyersCount: number
  lastSale: number
  poolId: string
}

export enum SpecificPoolItemOrderBy {
  timestamp = 'timestamp',
  name = 'name'
}

// eslint-disable-next-line no-shadow
export enum SpecificPoolItemFilter {
  live = 'live',
  winner = 'winner',
  lost = 'lost'
}

export enum OrderDirection {
  asc = 'asc',
  desc = 'desc'
}

export interface RockpoolFilter {
  type: SpecificPoolItemFilter
  sortingDirection: OrderDirection
  sortingField: SpecificPoolItemOrderBy
}

export const rockpoolFiltersVar = makeVar<RockpoolFilter>({
  type: SpecificPoolItemFilter.live,
  sortingDirection: OrderDirection.desc,
  sortingField: SpecificPoolItemOrderBy.timestamp
})
