import { FC } from 'react'
import Link from 'next/link'
import { optimizeImage } from 'lib/optmizeImage'
import ImagesGrid from './ImagesGrid'
import useCollections from 'hooks/useCollections'
import LoadingCard from './LoadingCard'

type Props = {
  collections: ReturnType<typeof useCollections>
}

const CollectionsGrid: FC<Props> = ({ collections }) => {
  const {
    collections: { data, isValidating },
    ref,
  } = collections

  const mappedCollections = data
    ? data.map(({ collections }) => collections).flat()
    : []
  const didReactEnd = data && data[data.length - 1].collections?.length === 0

  return (
    <div className="mx-auto mb-5 grid flex-wrap place-items-center justify-evenly gap-5 sm:justify-center md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      {!data && isValidating
        ? Array(16)
            .fill(null)
            .map((_, index) => (
              <div
                key={`loading-card-${index}`}
                className="h-[310px] w-full animate-pulse bg-white shadow-md"
              ></div>
            ))
        : mappedCollections?.map((collection, idx) => (
            <Link
              key={`${collection?.collection?.name}${idx}`}
              href={`/collections/${collection?.collection?.id}`}
            >
              <a className="group overflow-hidden rounded-md bg-white p-3 shadow transition hover:-translate-y-0.5 hover:shadow-lg">
                <ImagesGrid
                  sample_images={collection?.set?.sampleImages}
                  value={collection?.collection?.name}
                />
                <div className="mt-3 flex items-center gap-2">
                  <img
                    src={optimizeImage(collection?.collection?.image, 40)}
                    className="h-[40px] w-[40px] rounded-full"
                  />
                  <div className="font-semibold">
                    {collection?.collection?.name}
                  </div>
                </div>
              </a>
            </Link>
          ))}
      {!didReactEnd &&
        Array(20)
          .fill(null)
          .map((_, index) => {
            if (index === 0) {
              return <LoadingCard viewRef={ref} key={`loading-card-${index}`} />
            }
            return <LoadingCard key={`loading-card-${index}`} />
          })}
    </div>
  )
}

export default CollectionsGrid
