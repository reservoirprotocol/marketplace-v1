
const FINILIAR_API = process.env.NEXT_PUBLIC_FINILIAR_API || "https://api.finiliar.com"

export interface FiniliarMetadata {
  background: string,
  image: string,
  latestPrice: number,
  latestDelta: number,
  attributes?: {
    trait_type: string,
    value: string
  }[]
}

export async function fetchMetaFromFiniliar(tokenId: string): Promise<FiniliarMetadata> {
  const metadata = await (await fetch(FINILIAR_API + "/metadata/" + tokenId)).json()
  return metadata
}