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
    image: string | undefined
    name: string | undefined
  }
}

const Hero: FC<Props> = ({ stats, header }) => {
  return (
    <div className="mt-7 mb-10 space-y-5">
      <header className="flex items-center justify-center gap-5">
        <img className="h-[50px] w-[50px]" src={header.image} />
        <h1 className="text-xl font-bold">{header.name}</h1>
      </header>
      <div className="mx-auto grid max-w-screen-sm grid-cols-3 place-items-center gap-3 rounded-md bg-white p-4 shadow-md">
        <Stat name="count">{formatNumber(stats.count)}</Stat>
        <Stat name="top offer">
          <div className="ml-4 w-min">
            <FormatEth amount={stats.topOffer} maximumFractionDigits={4} />
          </div>
        </Stat>
        <Stat name="floor">
          <FormatEth amount={stats.floor} maximumFractionDigits={4} />
        </Stat>
      </div>
    </div>
  )
}

export default Hero

const Stat: FC<{ name: string }> = ({ name, children }) => (
  <div>
    <div className="font-medium uppercase opacity-75">{name}</div>
    <div className="text-lg font-semibold">{children}</div>
  </div>
)
