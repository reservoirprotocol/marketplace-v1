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
 * @param communityEnv Optional environment variable for the community id
 * @param collectionEnv Optional environment variable for the collection id
 * @returns The current wildcard (subdomain) and whether it corresponds to
 * a community or not
 */
export default function getMode(
  req: IncomingMessage,
  communityEnv?: string,
  collectionEnv?: string
) {
  let mode: 'global' | 'community' | 'collection' = 'global'

  if (communityEnv) {
    mode = 'community'
    return { mode, collectionId: communityEnv, isCommunity: true }
  }

  if (collectionEnv) {
    mode = 'collection'
    return {
      mode,
      collectionId: collectionEnv,
      isCommunity: false,
    }
  }

  // Handle wildcard
  const collectionId = getWildcard(req)
  const isCommunity = getIsCommunity(collectionId)

  mode =
    collectionId === 'www' ? 'global' : isCommunity ? 'community' : 'collection'

  return { mode, isCommunity, collectionId }
}
