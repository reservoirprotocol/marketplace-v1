import { FC } from 'react'
import Link from 'next/link'
import { optimizeImage } from 'lib/optmizeImage'
import FormatEth from 'components/FormatEth'
import useCollections from 'hooks/useCollections'
import { paths } from '@reservoir0x/client-sdk'
import { formatNumber } from 'lib/numbers'
import { useRouter } from 'next/router'

type Props = {
  fallback: {
    collections: paths['/collections/v2']['get']['responses']['200']['schema']
  }
}

type Volumes = 'hr24' | 'days7' | 'days30'

const TrendingCollectionTable: FC<Props> = ({ fallback }) => {
  const { query } = useRouter()
  const { collections, ref } = useCollections(fallback.collections)

  const { data } = collections

  const sort = query['sort']?.toString()

  // Reference: https://swr.vercel.app/examples/infinite-loading
  const mappedCollections = data
    ? data
        .flatMap(({ collections }) => collections)
        .sort((a, b) => {
          if (sort === 'days7' && a?.volume?.['7day'] && b?.volume?.['7day']) {
            return a.volume?.['7day'] - b.volume?.['7day']
          }
          if (
            sort === 'days30' &&
            a?.volume?.['30day'] &&
            b?.volume?.['30day']
          ) {
            return a.volume?.['30day'] - b.volume?.['30day']
          }
          if (a?.volume?.['1day'] && b?.volume?.['1day']) {
            return a.volume?.['1day'] - b.volume?.['1day']
          }
          return -1
        })
    : []

  return (
    <div className="mb-11 overflow-x-auto border-b border-gray-200 shadow dark:border-neutral-600 sm:rounded-lg">
      <table className="min-w-full table-auto divide-y divide-gray-200 dark:divide-neutral-600">
        <thead className="bg-gray-50 dark:bg-neutral-900">
          <tr>
            {['Collection', 'Volume', 'Floor Price', 'Supply'].map((item) => (
              <th
                key={item}
                scope="col"
                className="reservoir-label-l px-6 py-3 text-left dark:text-white"
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
              hr24,
              days30,
              days7,
              floorPrice,
              supply,
            } = processCollection(collection)

            const volume = {
              hr24,
              days7,
              days30,
            }

            return (
              <tr
                key={`${contract}-${index}`}
                ref={index === arr.length - 5 ? ref : null}
                className="group h-[80px] even:bg-neutral-100 dark:bg-neutral-900 dark:text-white dark:even:bg-neutral-800"
              >
                {/* COLLECTION */}
                <td className="reservoir-body flex items-center gap-4 whitespace-nowrap px-6 py-4 dark:text-white">
                  <div>{index + 1}</div>
                  <Link href={tokenHref}>
                    <a className="flex items-center gap-2">
                      {image && (
                        <img
                          src={optimizeImage(image, 35)}
                          className="rounded-full object-contain"
                        />
                      )}
                      <span className="whitespace-nowrap">
                        <div className="reservoir-h6 dark:text-white ">
                          {name}
                        </div>
                      </span>
                    </a>
                  </Link>
                </td>

                {/* VOLUME */}
                <td className="reservoir-body whitespace-nowrap px-6 py-4 dark:text-white">
                  <FormatEth
                    amount={
                      (sort === ('hr24' || 'days7' || 'days30') &&
                        volume[sort]) ||
                      hr24
                    }
                  />
                </td>

                {/* FLOOR PRICE */}
                <td className="reservoir-body whitespace-nowrap px-6 py-4 dark:text-white">
                  <FormatEth amount={floorPrice} />
                </td>

                {/* SUPPLY */}
                <td className="reservoir-body whitespace-nowrap px-6 py-4 dark:text-white">
                  {supply ? formatNumber(+supply) : '-'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default TrendingCollectionTable

function processCollection(
  collection:
    | NonNullable<
        NonNullable<Props['fallback']['collections']>['collections']
      >[0]
    | undefined
) {
  const data = {
    contract: collection?.primaryContract,
    image: collection?.image,
    name: collection?.name,
    hr24: collection?.['1dayVolume'],
    days30: collection?.['30dayVolume'],
    days7: collection?.['7dayVolume'],
    floorPrice: collection?.floorAskPrice,
    supply: collection?.tokenCount,
  }

  const tokenHref = `/collections/${data.contract}`

  return { ...data, tokenHref }
}
