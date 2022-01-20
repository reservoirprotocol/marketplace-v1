import { paths } from 'interfaces/apiTypes'
import { formatNumber } from 'lib/numbers'
import { FC } from 'react'
import FormatEth from './FormatEth'

type Props = {
  collection: paths['/collections/{collection}']['get']['responses']['200']['schema']
}

const Hero: FC<Props> = ({ collection }) => {
  const stats = {
    vol24: 10,
    count: collection?.collection?.set?.tokenCount,
    topOffer: collection?.collection?.set?.market?.topBuy?.value,
    floor: collection?.collection?.set?.market?.floorSell?.value,
  }

  const image = collection?.collection?.collection?.image
  const name = collection?.collection?.collection?.name

  return (
    <div className="space-y-5 mt-7 mb-10">
      <header className="flex gap-5 items-center justify-center">
        <img className="h-[50px] w-[50px]" src={image} />
        <h1 className="text-xl font-bold">{name}</h1>
      </header>
      <div className="grid gap-3 grid-cols-4 place-items-center max-w-screen-sm mx-auto shadow-md rounded-md p-4 bg-white">
        <Stat name="24HR Vol">
          <FormatEth amount={stats.vol24} maximumFractionDigits={2} />
        </Stat>
        <Stat name="count">{formatNumber(stats.count)}</Stat>
        <Stat name="top offer">
          <FormatEth amount={stats.topOffer} maximumFractionDigits={2} />
        </Stat>
        <Stat name="floor">
          <FormatEth amount={stats.floor} maximumFractionDigits={2} />
        </Stat>
      </div>
    </div>
  )
}

export default Hero

const Stat: FC<{ name: string }> = ({ name, children }) => (
  <div>
    <div className="uppercase font-medium opacity-75">{name}</div>
    <div className="text-lg font-semibold">{children}</div>
  </div>
)
