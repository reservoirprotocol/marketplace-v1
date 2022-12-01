
const FINILIAR_API = process.env.NEXT_PUBLIC_FINILIAR_API || "https://api.finiliar.com"

interface FiniliarMetadata {
  id: string,
  image: string,
}

export async function fetchMetaFromFiniliar(tokenId: string): Promise<FiniliarMetadata> {
  const metadata = await (await fetch(FINILIAR_API + "/metadata/" + tokenId)).json()
  return metadata
}