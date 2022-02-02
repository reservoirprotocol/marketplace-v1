import { paths } from 'interfaces/apiTypes'
import { FC } from 'react'
import Link from 'next/link'
import { optimizeImage } from 'lib/optmizeImage'
import { SWRResponse } from 'swr'

type Props = {
  communities: SWRResponse<
    paths['/collections']['get']['responses']['200']['schema'],
    any
  >
}

const CommunityGrid: FC<Props> = ({ communities }) => {
  const { data, isValidating } = communities

  return (
    <div className="mx-auto mb-5 flex max-w-screen-xl flex-wrap justify-evenly gap-5 sm:justify-center">
      {!data && isValidating
        ? Array(20)
            .fill(null)
            .map((_, index) => (
              <div
                key={`loading-card-${index}`}
                className="h-[130px] w-[130px] animate-pulse rounded-md bg-white shadow-md"
              ></div>
            ))
        : data?.collections?.map((community, idx) => (
            <Link
              key={`${community?.collection?.name}${idx}`}
              href={`/collections/${community?.collection?.id}`}
            >
              <a className="group overflow-hidden rounded-md bg-white shadow transition hover:-translate-y-0.5 hover:shadow-lg">
                <img
                  src={optimizeImage(community?.collection?.image, 250)}
                  alt={`${community?.collection?.name}`}
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

export default CommunityGrid
