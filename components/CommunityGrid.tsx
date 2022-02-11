import { FC } from 'react'
import Link from 'next/link'
import { optimizeImage } from 'lib/optmizeImage'
import Head from 'next/head'
import ImagesGrid from './ImagesGrid'
import useCommunity from 'hooks/useCommunity'
import LoadingCard from './LoadingCard'

type Props = {
  communities: ReturnType<typeof useCommunity>
  wildcard: string
}

const CommunityGrid: FC<Props> = ({ communities, wildcard }) => {
  const {
    communities: { data, isValidating },
    ref,
  } = communities

  const mappedCollections = data
    ? data.map(({ collections }) => collections).flat()
    : []
  const didReactEnd = data && data[data.length - 1].collections?.length === 0

  return (
    <>
      <div className="mx-auto mb-5 grid max-w-screen-xl flex-wrap justify-evenly gap-5 sm:justify-center md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {!data && isValidating
          ? Array(20)
              .fill(null)
              .map((_, index) => (
                <div
                  key={`loading-card-${index}`}
                  className="h-[310px] w-full animate-pulse bg-white shadow-md"
                ></div>
              ))
          : mappedCollections?.map((community, idx) => {
              return (
                <Link
                  key={`${community?.collection?.name}${idx}`}
                  href={`/collections/${community?.collection?.id}`}
                >
                  <a className="group overflow-hidden rounded-md bg-white p-3 shadow transition hover:-translate-y-0.5 hover:shadow-lg">
                    <ImagesGrid
                      sample_images={community?.set?.sampleImages}
                      value={community?.collection?.name}
                    />
                    <div className="mt-3 flex items-center gap-2">
                      <img
                        src={optimizeImage(community?.collection?.image, 40)}
                        className="h-[40px] w-[40px] rounded-full"
                      />
                      <div className="font-semibold">
                        {community?.collection?.name}
                      </div>
                    </div>
                  </a>
                </Link>
              )
            })}{' '}
        {!didReactEnd &&
          Array(20)
            .fill(null)
            .map((_, index) => {
              if (index === 0) {
                return (
                  <LoadingCard viewRef={ref} key={`loading-card-${index}`} />
                )
              }
              return <LoadingCard key={`loading-card-${index}`} />
            })}
      </div>
    </>
  )
}

export default CommunityGrid
