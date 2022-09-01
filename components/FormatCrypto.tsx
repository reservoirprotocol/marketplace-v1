import FormatCurrency from 'components/FormatCurrency'
import useCoinInfo from 'hooks/useCoinInfo'
import { FC, ComponentProps } from 'react'

type FormatCryptoProps = {
  address: string
  logoWidth?: number
}

type Props = ComponentProps<typeof FormatCurrency> & FormatCryptoProps

const FormatCrypto: FC<Props> = ({
  amount,
  maximumFractionDigits,
  address,
  logoWidth = 8,
}) => {
  const info = useCoinInfo(address)

  return (
    <FormatCurrency
      amount={amount}
      maximumFractionDigits={maximumFractionDigits}
    >
      {/* <img src={icon} alt="ETH logo" style={{ width: `${logoWidth}px` }} /> */}
    </FormatCurrency>
  )
}

export default FormatCrypto
