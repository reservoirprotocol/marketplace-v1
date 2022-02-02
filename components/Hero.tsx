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
    <div>
      {header?.banner && (
        <img
          src={header?.banner}
          alt={`${header.name} banner image`}
          className="h-[100px] w-full object-cover sm:h-[200px] sm:rounded-xl"
        />
      )}
      <div className="grid w-full place-items-center gap-5 px-2 py-6 lg:flex lg:items-center lg:justify-between">
        <div className="flex items-center">
          <img className="h-[70px] w-[70px] rounded-full" src={header.image} />
          <div className="ml-3">
            <h1 className="mb-1 text-2xl font-semibold">{header.name}</h1>
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
  <div className="grid items-center sm:flex sm:gap-1">
    <div className="text-sm font-medium uppercase opacity-75">{name}</div>
    <div className="font-semibold">{children}</div>
  </div>
)
