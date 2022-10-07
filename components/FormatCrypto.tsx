import FormatCurrency from 'components/FormatCurrency'
import { FC, ComponentProps, SyntheticEvent } from 'react'

type FormatCryptoProps = {
  address?: string
  logoWidth?: number
}

const API_BASE =
  process.env.NEXT_PUBLIC_RESERVOIR_API_BASE || 'https://api.reservoir.tools'

type Props = ComponentProps<typeof FormatCurrency> & FormatCryptoProps

const FormatCrypto: FC<Props> = ({
  amount,
  maximumFractionDigits,
  address,
  logoWidth = 16,
}) => {
  const logoUrl = `${API_BASE}/redirect/currency/${address}/icon/v1`
  const handleFallback = (e: SyntheticEvent) => {
    const img = e.target as HTMLImageElement
    img.src = `https://api.reservoir.tools/redirect/currency/${address}/icon/v1`
  };

  return (
    <FormatCurrency
      amount={amount}
      maximumFractionDigits={maximumFractionDigits}
    >
      {address && (
        <img
          src={logoUrl}
          alt="Currency Logo"
          onError={handleFallback}
          style={{ width: `${logoWidth}px` }}
        />
      )}
    </FormatCurrency>
  )
}

export default FormatCrypto
