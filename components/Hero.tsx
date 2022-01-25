import { formatNumber } from 'lib/numbers'
import { ComponentProps, FC } from 'react'
import { useNetwork } from 'wagmi'
import FormatEth from './FormatEth'
import OfferModal from './OfferModal'

type Props = Omit<ComponentProps<typeof OfferModal>, 'trigger'> & {
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

const Hero: FC<Props> = ({
  data,
  env,
  mutate,
  signer,
  stats,
  header,
  royalties,
}) => {
  const [{ data: network }] = useNetwork()
  const isInTheWrongNetwork = signer && network.chain?.id !== env.chainId

  return (
    <div className="mt-7 mb-10 space-y-5">
      <header className="flex items-center justify-center gap-5">
        <img className="h-[50px] w-[50px]" src={header.image} />
        <h1 className="text-xl font-bold">{header.name}</h1>
      </header>
      <div className="mx-auto grid max-w-screen-sm grid-cols-4 place-items-center gap-3 rounded-md bg-white p-4 shadow-md">
        <Stat name="24HR Vol">
          <FormatEth amount={stats.vol24} maximumFractionDigits={2} />
        </Stat>
        <Stat name="count">{formatNumber(stats.count)}</Stat>
        <OfferModal
          trigger={
            <button disabled={!signer || isInTheWrongNetwork}>
              <Stat name="top offer">
                <div className="ml-4 w-min">
                  <FormatEth
                    amount={stats.topOffer}
                    maximumFractionDigits={2}
                  />
                </div>
              </Stat>
            </button>
          }
          royalties={royalties}
          signer={signer}
          data={data}
          env={env}
          mutate={mutate}
        />
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
    <div className="font-medium uppercase opacity-75">{name}</div>
    <div className="text-lg font-semibold">{children}</div>
  </div>
)
