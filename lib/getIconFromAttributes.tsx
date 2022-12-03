import { TokenDetails } from 'types/reservoir'
import getAttributeFromTokenDetails from './getAttributeFromTokenDetails'

export default function getIconFromTokenDetails(tokenDetails: TokenDetails) {
  const family = getAttributeFromTokenDetails(tokenDetails, 'Family')
  if (!family) return
  return `/icons/${family.toLowerCase()}.svg`
}
