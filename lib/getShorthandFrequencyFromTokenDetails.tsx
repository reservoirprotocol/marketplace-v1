import { TokenDetails } from 'types/reservoir'
import getAttributeFromTokenDetails from './getAttributeFromTokenDetails'

export default function getShorthandFrequencyFromTokenDetails(tokenDetails: TokenDetails) {
  const freq = getAttributeFromTokenDetails(tokenDetails, 'Frequency')
  if (!freq) return

  switch (freq) {
    case 'Hourly':
      return 'hour'
    case 'Twice Daily':
      return '12 hours'
    case 'Daily':
      return 'day'
    case 'Weekly':
      return 'week'
    case 'Monthly':
      return 'month'
  }
}
