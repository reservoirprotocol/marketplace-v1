import { FC } from 'react'
import LoadingCard from './LoadingCard'
import { SWRInfiniteResponse } from 'swr/infinite/dist/infinite'
import Link from 'next/link'
import { optimizeImage } from 'lib/optmizeImage'
import { useInView } from 'react-intersection-observer'
import FormatEth from './FormatEth'
import Masonry from 'react-masonry-css'
import { paths } from '@reservoir0x/client-sdk/dist/types/api'
import FormatWEth from 'components/FormatWEth'
import Image from 'next/image'

const SOURCE_ID = process.env.NEXT_PUBLIC_SOURCE_ID
const NAVBAR_LOGO = process.env.NEXT_PUBLIC_NAVBAR_LOGO
const SOURCE_ICON = process.env.NEXT_PUBLIC_SOURCE_ICON

type Props = {
  tokens: SWRInfiniteResponse<
    paths['/tokens/v4']['get']['responses']['200']['schema'],
    any
  >
  collectionImage: string | undefined
  viewRef: ReturnType<typeof useInView>['ref']
}

const TokensGrid: FC<Props> = ({ tokens, viewRef, collectionImage }) => {
  const { data, error } = tokens

  // Reference: https://swr.vercel.app/examples/infinite-loading
  const mappedTokens = data ? data.flatMap(({ tokens }) => tokens) : []
  const isLoadingInitialData = !data && !error
  const didReachEnd =
    data &&
    (data[data.length - 1]?.tokens?.length === 0 ||
      data[data.length - 1]?.continuation === null)

  return (
    <Masonry
      key="tokensGridMasonry"
      breakpointCols={{
        default: 6,
        1900: 5,
        1536: 4,
        1280: 3,
        1024: 2,
        768: 2,
        640: 2,
        500: 1,
      }}
      className="masonry-grid"
      columnClassName="masonry-grid_column"
    >
      {isLoadingInitialData
        ? Array(10)
            .fill(null)
            .map((_, index) => <LoadingCard key={`loading-card-${index}`} />)
        : mappedTokens?.map((token, idx) => {
            if (!token) return null

            return (
              <Link
                key={`${token?.collection?.name}${idx}`}
                href={`/${token?.contract}/${token?.tokenId}`}
              >
                <a className="group relative mb-6 grid transform-gpu self-start overflow-hidden rounded-[16px] border border-[#D4D4D4] bg-white transition ease-in hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-lg hover:ease-out dark:border-0 dark:bg-neutral-800 dark:ring-1 dark:ring-neutral-600">
                  {token?.source && (
                    <img
                      className="absolute top-4 left-4 z-10 h-8 w-8"
                      src={
                        SOURCE_ID &&
                        token?.source &&
                        SOURCE_ID === token?.source
                          ? SOURCE_ICON || NAVBAR_LOGO
                          : `https://api.reservoir.tools/redirect/logo/v1?source=${token?.source}`
                      }
                      alt=""
                    />
                  )}
                  {token?.image ? (
                    <Image
                      loader={({ src }) => src}
                      src={optimizeImage(token?.image, 250)}
                      alt={`${token?.name}`}
                      className="w-full"
                      width={250}
                      height={250}
                      objectFit="cover"
                    />
                  ) : (
                    <div className="relative w-full">
                      <div className="absolute inset-0 grid place-items-center backdrop-blur-lg">
                        <div>
                          <img
                            src={optimizeImage(collectionImage, 250)}
                            alt={`${token?.collection?.name}`}
                            className="mx-auto mb-4 h-16 w-16 overflow-hidden rounded-full border-2 border-white"
                            width="64"
                            height="64"
                          />
                          <div className="reservoir-h6 text-white">
                            No Content Available
                          </div>
                        </div>
                      </div>
                      <img
                        src={optimizeImage(collectionImage, 250)}
                        alt={`${token?.collection?.name}`}
                        className="aspect-square w-full object-cover"
                        width="250"
                        height="250"
                      />
                    </div>
                  )}

                  <p
                    className="reservoir-subtitle mb-3 overflow-hidden truncate px-4 pt-4 dark:text-white lg:pt-3"
                    title={token?.name || token?.tokenId}
                  >
                    {token?.name || `#${token?.tokenId}`}
                  </p>
                  <div className="flex items-center justify-between px-4 pb-4 lg:pb-3">
                    <div>
                      <div className="reservoir-subtitle text-xs text-gray-400">
                        Price
                      </div>
                      <div className="reservoir-h6 dark:text-white">
                        <FormatEth
                          amount={token?.floorAskPrice}
                          logoWidth={7}
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="reservoir-subtitle text-xs text-gray-400">
                        Offer
                      </div>
                      <div className="reservoir-h6 dark:text-white">
                        <FormatWEth amount={token?.topBidValue} logoWidth={7} />
                      </div>
                    </div>
                  </div>
                </a>
              </Link>
            )
          })}
      {!didReachEnd &&
        Array(10)
          .fill(null)
          .map((_, index) => {
            if (index === 0) {
              return (
                <LoadingCard viewRef={viewRef} key={`loading-card-${index}`} />
              )
            }
            return <LoadingCard key={`loading-card-${index}`} />
          })}
    </Masonry>
  )
}

export default TokensGrid
