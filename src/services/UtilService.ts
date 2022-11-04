import BigNumber from 'bignumber.js'

export const formatToLocaleString = (
  value: string | number | BigNumber,
  maximumFractionDigits?: number,
  minimumFractionDigits?: number
) => {
  return new BigNumber(value).toNumber().toLocaleString('en-US', { maximumFractionDigits, minimumFractionDigits })
}
