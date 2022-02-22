export default function getIsCommunity(communityId: string) {
  const isCommunity = ['loot', 'bayc', 'forgottenrunes', 'artblocks'].includes(
    communityId
  )

  return isCommunity
}
