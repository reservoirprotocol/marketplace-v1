import { paths } from 'interfaces/apiTypes'
import { FC } from 'react'
import Link from 'next/link'
import { optimizeImage } from 'lib/optmizeImage'
import { SWRResponse } from 'swr'

type Props = {
  collections: SWRResponse<
    paths['/collections']['get']['responses']['200']['schema'],
    any
  >
}

const CollectionsGrid: FC<Props> = ({ collections }) => {
  const { data, isValidating } = collections

  const filteredCollecitons = data?.collections?.filter((collection) => {
    if (collection?.collection?.id === 'bored-ape-chemistry-club') return true

    return !!collection.collection?.tokenSetId
  })

  return (
    <div className="mx-auto mb-5 flex max-w-screen-xl flex-wrap justify-evenly gap-5 sm:justify-center">
      {!data && isValidating
        ? Array(16)
            .fill(null)
            .map((_, index) => (
              <div
                key={`loading-card-${index}`}
                className="h-[130px] w-[130px] animate-pulse rounded-full bg-white shadow-md"
              ></div>
            ))
        : filteredCollecitons?.map((collection, idx) => (
            <Link
              key={`${collection?.collection?.name}${idx}`}
              href={`/collections/${collection?.collection?.id}`}
            >
              <a className="group overflow-hidden rounded-full bg-white shadow transition hover:-translate-y-0.5 hover:shadow-lg">
                <img
                  src={optimizeImage(collection?.collection?.image, 130)}
                  alt={`${collection?.collection?.name}`}
                  className="h-[130px] w-[130px] object-cover"
                  width="130"
                  height="130"
                />
              </a>
            </Link>
          ))}
    </div>
  )
}

export default CollectionsGrid
