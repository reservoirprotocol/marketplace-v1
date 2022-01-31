import { formatNumber } from 'lib/numbers'
import { FC } from 'react'
import FormatEth from './FormatEth'

type Props = {
  stats: {
    vol24: number | undefined
    count: number | undefined
    topOffer: number | undefined
    floor: number | undefined
  }
  header: {
    banner: string | undefined
    image: string | undefined
    name: string | undefined
  }
}

const Hero: FC<Props> = ({ stats, header, children }) => {
  return (
    <div className="relative mb-20 mt-7">
      {header?.banner && (
        <img
          src={header?.banner}
          alt={`${header.name} banner image`}
          className="h-[200px] w-full object-cover"
        />
      )}
      <div
        className={`${
          header?.banner ? 'absolute' : ''
        } -bottom-12 grid w-full place-items-center gap-5 bg-[#f7f4f8] pt-3 lg:flex lg:items-center lg:justify-between lg:gap-2 lg:bg-transparent lg:bg-gradient-to-t lg:from-[#f7f4f8] lg:via-[#f7f4f8] lg:px-2 lg:pt-10`}
      >
        <div className="flex items-center">
          <img className="h-[60px] w-[60px] rounded-full" src={header.image} />
          <div className="ml-3">
            <h1 className="mb-1 text-xl font-semibold">{header.name}</h1>
            <div className="flex items-center gap-5">
              <Stat name="top offer">
                <FormatEth amount={stats.topOffer} maximumFractionDigits={4} />
              </Stat>
              <Stat name="floor">
                <FormatEth amount={stats.floor} maximumFractionDigits={4} />
              </Stat>
              <Stat name="items">{formatNumber(stats.count)}</Stat>
            </div>
          </div>
        </div>
        <div className="flex gap-3">{children}</div>
      </div>
    </div>
  )
}

export default Hero

const Stat: FC<{ name: string }> = ({ name, children }) => (
  <div className="flex items-center gap-1">
    <div className="text-sm font-medium uppercase opacity-75">{name}</div>
    <div className="font-semibold">{children}</div>
  </div>
)
