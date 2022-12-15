import { FC } from 'react'
import FormatNativeCrypto from 'components/FormatNativeCrypto'
import { formatNumber } from 'lib/numbers'
import FormatCrypto from 'components/FormatCrypto'
import { useCollections } from '@reservoir0x/reservoir-kit-ui'

const API_BASE =
  process.env.NEXT_PUBLIC_RESERVOIR_API_BASE || 'https://api.reservoir.tools'

type Currency = NonNullable<
  NonNullable<
    NonNullable<ReturnType<typeof useCollections>['data']>[0]['topBid']
  >['price']
>['currency']

type Props = {
  count: number
  topOffer: number | undefined
  topOfferCurrency: Currency
  topOfferSource: string | undefined
  floor: number | undefined
  allTime: number | undefined
  volumeChange: number | undefined
  floorChange: number | undefined
}

const HeroStats: FC<{ stats: Props }> = ({ stats }) => {
  const offerSourceLogo = `${API_BASE}/redirect/sources/${stats.topOfferSource}/logo/v2`

  return (
    <div className="grid min-w-full grid-cols-2 items-center gap-[1px] overflow-hidden rounded-lg border-[1px] border-gray-300 bg-gray-300 dark:border-[#525252] dark:bg-[#525252] md:m-0 md:h-[82px] md:min-w-[647px] md:grid-cols-4 md:gap-2 md:bg-white dark:md:bg-black">
      <Stat name="items">
        <h3 className="reservoir-h6 dark:text-white">
          {formatNumber(stats.count)}
        </h3>
      </Stat>
      <Stat name="top offer">
        <h3 className="reservoir-h6 flex items-center dark:text-white">
          {stats.topOfferSource && stats.topOffer && (
            <img
              className="mr-1 h-4 w-4"
              src={offerSourceLogo}
              alt="Source Logo"
            />
          )}
          <FormatCrypto
            amount={stats.topOffer}
            decimals={stats.topOfferCurrency?.decimals}
            address={stats.topOfferCurrency?.contract}
          />
        </h3>
      </Stat>
      <Stat name="floor">
        <h3 className="reservoir-h6 flex items-center justify-center gap-1 dark:text-white">
          <FormatNativeCrypto amount={stats.floor} maximumFractionDigits={2} />
          <PercentageChange value={stats.floorChange} />
        </h3>
      </Stat>
      <Stat name="total volume">
        <h3 className="reservoir-h6 flex items-center justify-center gap-1 dark:text-white">
          <FormatNativeCrypto
            amount={stats.allTime}
            maximumFractionDigits={2}
          />
        </h3>
      </Stat>
    </div>
  )
}

const Stat: FC<{ name: string }> = ({ name, children }) => (
  <div className="flex h-20 flex-col items-center justify-center bg-white dark:bg-black md:h-auto">
    {children}
    <p className="mt-1 text-[#A3A3A3]">{name}</p>
  </div>
)

export const PercentageChange: FC<{ value: number | undefined | null }> = ({
  value,
}) => {
  if (value === undefined || value === null) return null

  const percentage = (value - 1) * 100

  if (percentage > 100 || value === 0) {
    return null
  }

  if (value < 1) {
    return (
      <div className="text-sm text-[#FF3B3B]">{formatNumber(percentage)}%</div>
    )
  }

  if (value > 1) {
    return (
      <div className="text-sm text-[#06C270]">+{formatNumber(percentage)}%</div>
    )
  }

  return null
}

export default HeroStats
