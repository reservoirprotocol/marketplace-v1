/**
 * Detect wheter the first subdomain corresponds to a community
 * @param communityId The community ID
 * @returns `True` if the community ID corresponds to a community, `false` otherwise
 */
export default function getIsCommunity(communityId: string) {
  const isCommunity = ['loot', 'bayc', 'forgottenrunes', 'artblocks'].includes(
    communityId
  )

  return isCommunity
}
