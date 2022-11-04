import FormatCrypto from 'components/FormatCrypto'
import { constants } from 'ethers'
import useEnvChain from 'hooks/useEnvChain'
import { FC, ComponentProps } from 'react'
import { chain } from 'wagmi'

type Props = ComponentProps<typeof FormatCrypto>

const FormatNativeCrypto: FC<Props> = ({
  amount,
  maximumFractionDigits,
  logoWidth,
}) => {
  const envChain = useEnvChain()
  let address = constants.AddressZero
  let decimals = 18

  switch (envChain?.id) {
    case chain.polygon.id:
      address = '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0'
      decimals = chain.polygon.nativeCurrency?.decimals || decimals
      break
  }

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
