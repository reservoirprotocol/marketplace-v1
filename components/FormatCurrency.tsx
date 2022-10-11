import { BigNumberish } from 'ethers'
import { formatBN } from 'lib/numbers'
import { FC } from 'react'

type Props = {
  amount: BigNumberish | null | undefined
  maximumFractionDigits?: number
  children?: React.ReactNode
  decimals?: number
}

const FormatCurrency: FC<Props> = ({
  amount,
  maximumFractionDigits = 2,
  children,
  decimals,
}) => {
  const value = formatBN(amount, maximumFractionDigits, decimals)

  return (
    <div className="inline-flex flex-none items-center gap-1">
      {value !== '-' ? children : null}
      <span className="flex-grow whitespace-nowrap font-semibold">{value}</span>
    </div>
  )
}

export default FormatCurrency
