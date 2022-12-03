import { TokenDetails } from 'types/reservoir'

export default function getAttributeFromTokenDetails(tokenDetails: TokenDetails, key: string) {
  if (!tokenDetails || !tokenDetails.attributes) return

  for (let i = 0; i < tokenDetails.attributes.length; i++) {
    if (tokenDetails.attributes[i].key === key) {
      return tokenDetails.attributes[i].value
    }
  }
}
