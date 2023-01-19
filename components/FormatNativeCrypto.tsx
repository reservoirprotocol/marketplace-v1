import FormatCrypto from 'components/FormatCrypto'
import { constants } from 'ethers'
import { FC, ComponentProps } from 'react'

type Props = ComponentProps<typeof FormatCrypto>

const FormatNativeCrypto: FC<Props> = ({
  amount,
  maximumFractionDigits,
  logoWidth,
}) => {
  const address = constants.AddressZero
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
