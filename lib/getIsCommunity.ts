export default function getIsCommunity(wildcard: string) {
  const isCommunity = ['loot', 'bayc', 'forgottenrunes', 'artblocks'].includes(
    wildcard
  )

  return isCommunity
}
