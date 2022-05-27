import { utils } from 'ethers'
import { BigNumberish } from '@ethersproject/bignumber'

const { format: formatDollar } = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

function formatNumber(
  amount: number | null | undefined,
  maximumFractionDigits: number = 2
) {
  const { format } = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: maximumFractionDigits,
  })
  if (!amount) {
    return '-'
  }
  return format(amount)
}

/**
 *  Convert ETH values to human readable formats
 * @param amount An ETH amount
 * @param maximumFractionDigits Number of decimal digits
 * @returns returns the ETH value as a `string` or `-` if the amount is `null` or `undefined`
 */
function formatBN(
  amount: BigNumberish | null | undefined,
  maximumFractionDigits: number
) {
  if (typeof amount === 'undefined' || amount === null) return '-'

  let value = ''

  if (typeof amount === 'number') {
    value = new Intl.NumberFormat('en-US', {
      maximumFractionDigits,
      notation: 'compact',
      compactDisplay: 'short',
    }).format(amount)
  } else {
    value = new Intl.NumberFormat('en-US', {
      maximumFractionDigits,
      notation: 'compact',
      compactDisplay: 'short',
    }).format(+utils.formatEther(amount))
  }

  return value
}

export { formatDollar, formatBN, formatNumber }
