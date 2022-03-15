import { paths } from 'interfaces/apiTypes'
import { FC } from 'react'
import LoadingCard from './LoadingCard'
import { SWRInfiniteResponse } from 'swr/infinite/dist/infinite'
import Link from 'next/link'
import { optimizeImage } from 'lib/optmizeImage'
import { useInView } from 'react-intersection-observer'
import FormatEth from './FormatEth'
import Masonry from 'react-masonry-css'

type Props = {
  tokens: SWRInfiniteResponse<
    paths['/tokens']['get']['responses']['200']['schema'],
    any
  >
  viewRef: ReturnType<typeof useInView>['ref']
  tokenCount: number
}

const TokensGrid: FC<Props> = ({ tokens, viewRef, tokenCount }) => {
  const { data, isValidating, size } = tokens

  // Reference: https://swr.vercel.app/examples/infinite-loading
  const mappedTokens = data ? data.map(({ tokens }) => tokens).flat() : []
  const isEmpty = mappedTokens.length === 0
  const didReactEnd = isEmpty || (data && mappedTokens.length < tokenCount)

  return (
    <Masonry
      breakpointCols={{
        default: 4,
        1280: 4,
        1024: 3,
        768: 2,
        640: 2,
        500: 1,
      }}
      className="masonry-grid"
      columnClassName="masonry-grid_column"
    >
      {size === 1 && isValidating
        ? Array(20).map((_, index) => (
            <LoadingCard key={`loading-card-${index}`} />
          ))
        : mappedTokens?.map((token, idx) => (
            <Link
              key={`${token?.collection?.name}${idx}`}
              href={`/${token?.contract}/${token?.tokenId}`}
            >
              <a className="group mb-6 grid self-start overflow-hidden rounded-[16px] bg-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg">
                <img
                  src={optimizeImage(token?.image, 250)}
                  alt={`${token?.collection?.name}`}
                  className="w-full"
                  width="250"
                  height="250"
                />
                <p
                  className="reservoir-subtitle mb-3 overflow-hidden truncate px-6 pt-4 lg:pt-3"
                  title={token?.name || token?.tokenId}
                >
                  {token?.name || `#${token?.tokenId}`}
                </p>
                <div className="flex items-center justify-between px-6 pb-4 lg:pb-3">
                  <div>
                    <div className="reservoir-subtitle text-gray-400">
                      Offer
                    </div>
                    <div className="reservoir-h6">
                      <FormatEth
                        amount={token?.topBuyValue}
                        maximumFractionDigits={4}
                        logoWidth={7}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="reservoir-subtitle text-gray-400">
                      Price
                    </div>
                    <div className="reservoir-h6">
                      <FormatEth
                        amount={token?.floorSellValue}
                        maximumFractionDigits={4}
                        logoWidth={7}
                      />
                    </div>
                  </div>
                </div>
              </a>
            </Link>
          ))}
      {didReactEnd &&
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
    </Masonry>
  )
}

export default TokensGrid
