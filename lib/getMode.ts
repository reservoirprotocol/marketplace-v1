import { IncomingMessage } from 'http'
import getIsCommunity from './getIsCommunity'
import getWildcard from './getWildcard'

/**
 * Handle wildcard logic to support base domain, communities and collections
 *
 * The mode is used to load data and use certain layouts depending on the
 * subdomain
 * - https://www.reservoir.market -> `global` (Displays all collections)
 * - https://lootproject.reservoir.market -> `collection` (Displays collection tokens)
 * - https://loot.reservoir.market -> `community` (Displays community collections)
 * @param req Client's incoming request object
 * @param community Optional environment variable for the community id
 * @param collection Optional environment variable for the collection id
 * @returns The current wildcard (subdomain) and whether it corresponds to
 * a community or not
 */
export default function getMode(
  req: IncomingMessage,
  USE_WILDCARD: string | undefined,
  community?: string,
  collection?: string
) {
  let mode: 'global' | 'community' | 'collection' = 'global'

  if (community) {
    mode = 'community'
    return { mode, collectionId: community, isCommunity: true }
  }

  if (collection) {
    mode = 'collection'
    return {
      mode,
      collectionId: collection,
      isCommunity: false,
    }
  }

  if (!USE_WILDCARD)
    return {
      mode,
      collectionId: '',
    }

  // Handle wildcard
  const collectionId = getWildcard(req)
  const isCommunity = getIsCommunity(collectionId)

  mode =
    collectionId === 'www' ? 'global' : isCommunity ? 'community' : 'collection'

  return { mode, isCommunity, collectionId }
}
