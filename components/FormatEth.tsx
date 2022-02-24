import { BigNumberish } from 'ethers'
import { formatBN } from 'lib/numbers'
import { FC } from 'react'

type Props = {
  amount: BigNumberish | null | undefined
  maximumFractionDigits: number
  logoWidth?: number
}

const FormatEth: FC<Props> = ({ amount, maximumFractionDigits, logoWidth }) => {
  const value = formatBN(amount, maximumFractionDigits)
  return (
    <div className="inline-flex items-center gap-1">
      {value !== '-' && (
        <img
          src="/eth.svg"
          alt="ETH logo"
          style={{ width: `${logoWidth ?? 8}px` }}
        />
      )}
      <span className="flex-grow">{value}</span>
    </div>
  )
}

export default FormatEth
