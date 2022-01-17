import { paths } from 'interfaces/apiTypes'
import { formatNumber, formatBN } from 'lib/numbers'
import { FC } from 'react'

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
        <Stat name="24HR Vol" value={formatBN(stats.vol24, 2)} />
        <Stat name="count" value={formatNumber(stats.count)} />
        <Stat name="top offer" value={formatBN(stats.topOffer, 2)} />
        <Stat name="floor" value={formatBN(stats.floor, 2)} />
      </div>
    </div>
  )
}

export default Hero

const Stat: FC<{ name: string; value: string }> = ({ name, value }) => (
  <div>
    <div className="uppercase font-medium opacity-75">{name}</div>
    <div className="text-lg font-semibold">{value}</div>
  </div>
)
