import { FC, useMemo } from 'react'
import Link from 'next/link'
import cn from 'classnames';
import { optimizeImage } from 'lib/optmizeImage'
import FormatEth from 'components/FormatEth'
import useCollections from 'hooks/useCollections'
import useCollectionsByContracts from 'hooks/useCollectionsByContracts';
import { paths } from '@reservoir0x/reservoir-kit-client'
import { formatNumber } from 'lib/numbers'
import { useRouter } from 'next/router'
import { PercentageChange } from './hero/HeroStats'
import { useMediaQuery } from '@react-hookz/web'

type Props = {
  fallback: {
    collections: paths['/collections/v4']['get']['responses']['200']['schema']
  }
}

// some that have just been created for testing
const whitelistedCollections = [
  '0xfe7a68730499413a5819ab5f68191aac4b3ca7b5', // Autobahn Genesis Cars
  '0xc078e2264f06480380b1ddc31cbd573fb16ba01d' //, // Hodlers Club NFTs
  // '0x67158b788968f78541847bce0bc9c495ed526831' // Autobahn Raffle Tickets
]

const TrendingCollectionTable: FC<Props> = ({ fallback }) => {
  const isSmallDevice = useMediaQuery('only screen and (max-width : 600px)')
  const router = useRouter()
  const { collections, ref } = useCollectionsByContracts(router, whitelistedCollections, fallback.collections)

  const { data } = collections

  const sort = router?.query['sort']?.toString()

  // Reference: https://swr.vercel.app/examples/infinite-loading
  const mappedCollections = useMemo(() => {
    return (data
      ? data.flatMap(({ collections }) => collections)
      : [])
  }, [data])

  const columns = isSmallDevice
    ? ['Collection', 'Floor Price']
    : ['Collection', 'Volume', 'Floor Price', 'Supply']

  return (
    <div className="mb-11 p-4 overflow-x-auto bg-white content-container">
      <table className="min-w-full table-auto">
        <thead>
          <tr>
            {columns.map((item) => (
              <th
                key={item}
                scope="col"
                className="reservoir-subtitle px-6 py-3 text-left dark:text-white"
              >
                {item}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {mappedCollections?.map((collection, index, arr) => {
            const {
              contract,
              tokenHref,
              image,
              name,
              days1,
              days30,
              days7,
              days1Change,
              days7Change,
              days30Change,
              floorSaleChange1Days,
              floorSaleChange7Days,
              floorSaleChange30Days,
              floorPrice,
              supply,
            } = processCollection(collection)

            return (
              <tr
                key={`${contract}-${index}`}
                ref={index === arr.length - 5 ? ref : null}
                className={cn("group h-[88px] border-neutral-300 dark:border-neutral-600 dark:text-white", {
                  "border-b": index !== arr.length - 1
                })}
              >
                {/* COLLECTION */}
                <td className="reservoir-body flex items-center gap-4 whitespace-nowrap px-6 py-4 dark:text-white">
                  <div className="reservoir-h6 mr-6 dark:text-white">
                    {index + 1}
                  </div>
                  <Link href={tokenHref}>
                    <a className="flex items-center gap-2">
                      <img
                        src={optimizeImage(image, 140)}
                        className="h-[56px] w-[56px] rounded-full object-cover"
                      />
                      <div
                        className={`reservoir-h6 overflow-hidden truncate whitespace-nowrap dark:text-white ${
                          isSmallDevice ? 'max-w-[140px]' : ''
                        }`}
                      >
                        {name}
                      </div>
                    </a>
                  </Link>
                </td>

                {/* VOLUME */}
                {!isSmallDevice && (
                  <td className="reservoir-body whitespace-nowrap px-6 py-4 dark:text-white">
                    <FormatEth
                      amount={
                        sort === '7DayVolume'
                          ? days7
                          : sort === '30DayVolume'
                          ? days30
                          : days1
                      }
                    />
                    <PercentageChange
                      value={
                        sort === '7DayVolume'
                          ? days7Change
                          : sort === '30DayVolume'
                          ? days30Change
                          : days1Change
                      }
                    />
                  </td>
                )}

                {/* FLOOR PRICE */}
                <td className="reservoir-body whitespace-nowrap px-6 py-4 dark:text-white">
                  <FormatEth amount={floorPrice} />
                  <PercentageChange
                    value={
                      sort === '7DayVolume'
                        ? floorSaleChange7Days
                        : sort === '30DayVolume'
                        ? floorSaleChange30Days
                        : floorSaleChange1Days
                    }
                  />
                </td>

                {/* SUPPLY */}
                {!isSmallDevice && (
                  <td className="reservoir-body whitespace-nowrap px-6 py-4 dark:text-white">
                    {supply ? formatNumber(+supply) : '-'}
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default TrendingCollectionTable

function getFloorDelta(
  currentFloor: number | undefined,
  previousFloor: number | undefined
) {
  if (!currentFloor || !previousFloor) return 0

  return (currentFloor - previousFloor) / previousFloor
}

function processCollection(
  collection:
    | NonNullable<
        NonNullable<Props['fallback']['collections']>['collections']
      >[0]
    | undefined
) {
  const data = {
    contract: collection?.primaryContract,
    id: collection?.id,
    image: collection?.image || 'https://ik.imagekit.io/autobahn/showroom-default-image_cZvv3FPZ-.png',
    name: collection?.name,
    days1: collection?.volume?.['1day'],
    days7: collection?.volume?.['7day'],
    days30: collection?.volume?.['30day'],
    days1Change: collection?.volumeChange?.['1day'],
    days7Change: collection?.volumeChange?.['7day'],
    days30Change: collection?.volumeChange?.['30day'],
    floor1Days: collection?.floorSale?.['1day'],
    floor7Days: collection?.floorSale?.['7day'],
    floor30Days: collection?.floorSale?.['30day'],
    floorSaleChange1Days: collection?.floorSaleChange?.['1day'],
    floorSaleChange7Days: collection?.floorSaleChange?.['7day'],
    floorSaleChange30Days: collection?.floorSaleChange?.['30day'],
    floorPrice: collection?.floorAskPrice,
    supply: collection?.tokenCount,
  }

  const tokenHref = `/collections/${data.id}`

  return { ...data, tokenHref }
}
