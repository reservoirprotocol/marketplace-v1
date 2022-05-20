import FormatCurrency from 'components/FormatCurrency'
import { FC, ComponentProps } from 'react'

type FormatWEthProps = {
  logoWidth?: number
}

type Props = ComponentProps<typeof FormatCurrency> & FormatWEthProps

const FormatWEth: FC<Props> = ({
  amount,
  maximumFractionDigits,
  logoWidth = 8,
}) => {
  return (
    <FormatCurrency
      amount={amount}
      maximumFractionDigits={maximumFractionDigits}
    >
      <img
        src="/weth.svg"
        alt="WETH logo"
        style={{ width: `${logoWidth}px` }}
      />
    </FormatCurrency>
  )
}

export default FormatWEth
