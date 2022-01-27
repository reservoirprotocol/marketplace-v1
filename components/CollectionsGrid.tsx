import { paths } from 'interfaces/apiTypes'
import { FC } from 'react'
import LoadingCard from './LoadingCard'
import { SWRInfiniteResponse } from 'swr/infinite/dist/infinite'
import Link from 'next/link'
import { optimizeImage } from 'lib/optmizeImage'
import { useInView } from 'react-intersection-observer'
import FormatEth from './FormatEth'

type Props = {
  collections: SWRInfiniteResponse<
    paths['/collections']['get']['responses']['200']['schema'],
    any
  >
  viewRef: ReturnType<typeof useInView>['ref']
}

const CollectionsGrid: FC<Props> = ({ collections, viewRef }) => {
  const { data, isValidating, size } = collections

  // Reference: https://swr.vercel.app/examples/infinite-loading
  const mappedCollections = data
    ? data.map(({ collections }) => collections).flat()
    : []
  const isEmpty = mappedCollections.length === 0
  const didReachEnd =
    isEmpty || data?.[data.length - 1]?.collections?.length === 0

  return (
    <div className="mx-auto mb-5 grid max-w-[2400px] gap-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
      {size === 1 && isValidating
        ? Array(20).map((_, index) => (
            <LoadingCard key={`loading-card-${index}`} />
          ))
        : mappedCollections?.map((collection, idx) => (
            <Link
              key={`${collection?.collection?.name}${idx}`}
              href={`/collections/${collection?.collection?.id}`}
            >
              <a className="group grid rounded-b-md bg-white transition hover:-translate-y-0.5 hover:shadow-lg dark:bg-black">
                <img
                  src={optimizeImage(collection?.collection?.image, 250)}
                  alt={`${collection?.collection?.name}`}
                  className="w-full"
                  width="250"
                  height="250"
                />
                <p className="mb-3 px-6 pt-4 text-lg lg:pt-3">
                  {collection?.collection?.name}
                </p>
                <div className="flex items-center justify-between px-6 pb-4 lg:pb-3">
                  <div>
                    <div className="text-sm uppercase text-neutral-500 dark:text-neutral-400">
                      Offer
                    </div>
                    <div>
                      <FormatEth
                        amount={collection?.set?.market?.topBuy?.value}
                        maximumFractionDigits={4}
                        logoWidth={7}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm uppercase text-neutral-500 dark:text-neutral-400">
                      Price
                    </div>
                    <div>
                      <FormatEth
                        amount={collection?.set?.market?.floorSell?.value}
                        maximumFractionDigits={4}
                        logoWidth={7}
                      />
                    </div>
                  </div>
                </div>
              </a>
            </Link>
          ))}
      {!didReachEnd &&
        Array(20)
          .fill(null)
          .map((_, index) => {
            if (index === 0) {
              return (
                <LoadingCard viewRef={viewRef} key={`loading-card-${index}`} />
              )
            }
            return <LoadingCard key={`loading-card-${index}`} />
          })}
    </div>
  )
}

export default CollectionsGrid
