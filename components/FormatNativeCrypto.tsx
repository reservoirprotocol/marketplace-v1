import FormatCrypto from 'components/FormatCrypto'
import { constants } from 'ethers'
import { FC, ComponentProps } from 'react'

type Props = ComponentProps<typeof FormatCrypto>

const FormatNativeCrypto: FC<Props> = ({
  amount,
  maximumFractionDigits,
  logoWidth,
  orderType
}) => {
  // use WETH logo if this was an offer accepted, otherwise fall back to ETH logo
  const address = orderType === 'bid' ? '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' : constants.AddressZero
  const decimals = 18

  return (
    <FormatCrypto
      logoWidth={logoWidth}
      amount={amount}
      address={address}
      decimals={decimals}
      maximumFractionDigits={maximumFractionDigits}
    />
  )
}

export default FormatNativeCrypto
