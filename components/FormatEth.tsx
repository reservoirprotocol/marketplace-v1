import FormatCrypto from 'components/FormatCrypto'
import { constants } from 'ethers'
import { FC, ComponentProps } from 'react'

type Props = ComponentProps<typeof FormatCrypto>

const FormatEth: FC<Props> = ({
  amount,
  maximumFractionDigits,
  logoWidth,
  decimals,
}) => {
  return (
    <FormatCrypto
      logoWidth={logoWidth}
      amount={amount}
      address={constants.AddressZero}
      decimals={decimals}
      maximumFractionDigits={maximumFractionDigits}
    />
  )
}

export default FormatEth
