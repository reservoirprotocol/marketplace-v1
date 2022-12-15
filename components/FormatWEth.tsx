import FormatCrypto from 'components/FormatCrypto'
import { FC, ComponentProps } from 'react'

type Props = ComponentProps<typeof FormatCrypto>
const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID

const wethContracts: Record<number, string> = {
  1: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  4: '0xc778417E063141139Fce010982780140Aa0cD5Ab',
  5: '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6',
}

const FormatWEth: FC<Props> = ({
  amount,
  maximumFractionDigits,
  logoWidth,
}) => {
  const address =
    CHAIN_ID !== undefined && CHAIN_ID in wethContracts
      ? wethContracts[+CHAIN_ID]
      : wethContracts[1]

  return (
    <FormatCrypto
      logoWidth={logoWidth}
      amount={amount}
      address={address}
      decimals={18}
      maximumFractionDigits={maximumFractionDigits}
    />
  )
}

export default FormatWEth
