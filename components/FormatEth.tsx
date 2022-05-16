import { BigNumberish } from 'ethers'
import { formatBN } from 'lib/numbers'
import { FC } from 'react'

const DARK_MODE = process.env.NEXT_PUBLIC_DARK_MODE

type Props = {
  amount: BigNumberish | null | undefined
  maximumFractionDigits: number
  logoWidth?: number
}

const FormatEth: FC<Props> = ({ amount, maximumFractionDigits, logoWidth }) => {
  const value = formatBN(amount, maximumFractionDigits)

  const icon = DARK_MODE ? '/eth-dark.svg' : '/eth.svg'
  return (
    <div className="inline-flex flex-none items-center gap-1">
      {value !== '-' && (
        <img
          src={icon}
          alt="ETH logo"
          style={{ width: `${logoWidth ?? 8}px` }}
        />
      )}
      <span className="flex-grow font-semibold">{value}</span>
    </div>
  )
}

export default FormatEth
