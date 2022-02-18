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
export default function handleWildcard(
  req: IncomingMessage,
  communityEnv?: string,
  collectionEnv?: string
) {
  if (communityEnv) {
    return { wildcard: communityEnv, isCommunity: true }
  }

  if (collectionEnv) {
    return { wildcard: collectionEnv, isCommunity: false }
  }

  // Handle wildcard
  const wildcard = getWildcard(req)
  const isCommunity = getIsCommunity(wildcard)

  return { wildcard, isCommunity }
}
