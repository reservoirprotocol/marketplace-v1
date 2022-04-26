import { FC } from 'react'
import Link from 'next/link'
import { optimizeImage } from 'lib/optmizeImage'
import ImagesGrid from './ImagesGrid'
import useCollections from 'hooks/useCollections'
import LoadingCardCollection from './LoadingCardCollection'
import Masonry from 'react-masonry-css'

type Props = {
  collections: ReturnType<typeof useCollections>
}

const CollectionsGrid: FC<Props> = ({ collections }) => {
  const {
    collections: { data, isValidating },
    ref,
  } = collections

  const mappedCollections = data
    ? data
        .flatMap(({ collections }) => collections)
        // @ts-ignore
        .filter((collection) => !collection?.sampleImages?.includes(null))
    : []
  const didReactEnd = data && data[data.length - 1].collections?.length === 0

  return (
    <Masonry
      breakpointCols={{
        default: 5,
        1536: 4,
        1280: 3,
        1024: 3,
        768: 2,
        640: 2,
        500: 1,
      }}
      className="masonry-grid col-span-full px-2"
      columnClassName="masonry-grid_column"
    >
      {!data && isValidating
        ? Array(16)
            .fill(null)
            .map((_, index) => (
              <div
                key={`loading-card-${index}`}
                className="h-[310px] w-full animate-pulse bg-white shadow-md"
              ></div>
            ))
        : mappedCollections
            ?.filter((collection) => {
              if (collection?.tokenCount) {
                return +collection.tokenCount <= 30000
              }
              return false
            })
            .map((collection, idx) => (
              <Link
                key={`${collection?.name}${idx}`}
                href={`/collections/${collection?.id}`}
              >
                <a className="group mb-6 block overflow-hidden rounded-[16px] bg-white p-3 shadow transition hover:-translate-y-0.5 hover:shadow-lg">
                  <ImagesGrid
                    sample_images={collection?.sampleImages}
                    value={collection?.name || ''}
                  />
                  <div className="mt-3 flex items-center gap-2">
                    {collection?.image ? (
                      <img
                        src={optimizeImage(collection?.image, 80)}
                        className="h-12 w-12 rounded-full"
                      />
                    ) : (
                      <div className="h-12 w-12 flex-none rounded-full bg-gradient-to-br from-primary-500 to-primary-900"></div>
                    )}

                    <div className="reservoir-subtitle">{collection?.name}</div>
                  </div>
                </a>
              </Link>
            ))}
      {!didReactEnd &&
        Array(20)
          .fill(null)
          .map((_, index) => {
            if (index === 0) {
              return (
                <LoadingCardCollection
                  viewRef={ref}
                  key={`loading-card-${index}`}
                />
              )
            }
            return <LoadingCardCollection key={`loading-card-${index}`} />
          })}
    </Masonry>
  )
}

export default CollectionsGrid
