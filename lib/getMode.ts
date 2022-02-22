import { IncomingMessage } from 'http'
import getIsCommunity from './getIsCommunity'
import getWildcard from './getWildcard'

/**
 * Handle wildcard logic to support base domain, communities and collections
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
  if (communityEnv) {
    return { mode: 'community', collectionId: communityEnv, isCommunity: true }
  }

  if (collectionEnv) {
    return {
      mode: 'collection',
      collectionId: collectionEnv,
      isCommunity: false,
    }
  }

  // Handle wildcard
  const collectionId = getWildcard(req)
  const isCommunity = getIsCommunity(collectionId)

  const mode =
    collectionId === 'www' ? 'global' : isCommunity ? 'community' : 'collection'

  return { mode, isCommunity, collectionId }
}
