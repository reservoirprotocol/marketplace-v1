import { utils } from 'ethers'
import { BigNumberish } from '@ethersproject/bignumber'

const { format: formatUsdCurrency } = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

function formatDollar(price?: number | null) {
  return price !== undefined && price !== null ? formatUsdCurrency(price) : '-'
}

const trauncateFractionAndFormat = (
  parts: Intl.NumberFormatPart[],
  digits: number
) => {
  return parts
    .map(({ type, value }) => {
      if (type !== 'fraction' || !value || value.length < digits) {
        return value
      }

      let formattedValue = ''
      for (
        let idx = 0, counter = 0;
        idx < value.length && counter < digits;
        idx++
      ) {
        if (value[idx] !== '0') {
          counter++
        }
        formattedValue += value[idx]
      }
      return formattedValue
    })
    .reduce((string, part) => string + part)
}

function formatNumber(
  amount: number | null | undefined,
  maximumFractionDigits: number = 2
) {
  if (!amount) {
    return '-'
  }

  const { format } = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: maximumFractionDigits,
  })

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
  maximumFractionDigits: number,
  decimals?: number
) {
  if (typeof amount === 'undefined' || amount === null) return '-'

  const amountToFormat =
    typeof amount === 'number'
      ? amount
      : +utils.formatUnits(amount, decimals || 18)

  const parts = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 20,
    notation: 'compact',
    compactDisplay: 'short',
  }).formatToParts(amountToFormat)

  if (parts && parts.length > 0) {
    const maxDecimals = amountToFormat > 1000 ? 1 : maximumFractionDigits
    return trauncateFractionAndFormat(parts, maxDecimals)
  } else {
    return amount
  }
}

export { formatDollar, formatBN, formatNumber }
