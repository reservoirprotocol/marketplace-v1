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
    ? data.map(({ collections }) => collections).flat()
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
      className="masonry-grid"
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
        : mappedCollections?.map((collection, idx) => (
            <Link
              key={`${collection?.collection?.name}${idx}`}
              href={`/collections/${collection?.collection?.id}`}
            >
              <a className="group mb-6 block overflow-hidden rounded-[16px] bg-white p-3 shadow transition hover:-translate-y-0.5 hover:shadow-lg">
                <ImagesGrid
                  sample_images={collection?.set?.sampleImages}
                  value={collection?.collection?.name}
                />
                <div className="mt-3 flex items-center gap-2">
                  <img
                    src={optimizeImage(collection?.collection?.image, 40)}
                    className="h-12 w-12 rounded-full"
                  />
                  <div className="reservoir-subtitle">
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
