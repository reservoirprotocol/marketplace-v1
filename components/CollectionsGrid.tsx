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

  return (
    <div className="mx-auto mb-5 flex max-w-screen-xl flex-wrap justify-evenly gap-5 sm:justify-center">
      {!data && isValidating
        ? Array(16)
            .fill(null)
            .map((_, index) => (
              <div
                key={`loading-card-${index}`}
                className="h-[130px] w-[130px] animate-pulse rounded-md bg-white shadow-md"
              ></div>
            ))
        : data?.collections?.map((collection, idx) => (
            <Link
              key={`${collection?.collection?.name}${idx}`}
              href={`/collections/${collection?.collection?.id}`}
            >
              <a className="group overflow-hidden rounded-md bg-white transition hover:-translate-y-0.5 hover:shadow-lg">
                <img
                  src={optimizeImage(collection?.collection?.image, 130)}
                  alt={`${collection?.collection?.name}`}
                  className="h-[130px] w-[130px] object-contain"
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
