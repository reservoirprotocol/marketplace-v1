import { paths } from 'interfaces/apiTypes'
import { FC } from 'react'
import LoadingCard from './LoadingCard'
import { SWRInfiniteResponse } from 'swr/infinite/dist/infinite'
import Link from 'next/link'
import { optimizeImage } from 'lib/optmizeImage'
import useIsVisible from 'lib/useIsVisible'
import FormatEth from './FormatEth'

type Props = {
  tokens: SWRInfiniteResponse<
    paths['/tokens']['get']['responses']['200']['schema'],
    any
  >
  viewRef: ReturnType<typeof useIsVisible>['containerRef']
  tokenCount: number
}

const TokensGrid: FC<Props> = ({ tokens, viewRef, tokenCount }) => {
  const { data, isValidating, size } = tokens

  // Reference: https://swr.vercel.app/examples/infinite-loading
  const mappedTokens = data ? data.map(({ tokens }) => tokens).flat() : []
  const isEmpty = mappedTokens.length === 0
  const didReactEnd = isEmpty || (data && mappedTokens.length < tokenCount)

  return (
    <div className="mb-5 gap-10 mx-auto max-w-[2400px] grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
      {size === 1 && isValidating
        ? Array(20).map((_, index) => (
            <LoadingCard key={`loading-card-${index}`} />
          ))
        : mappedTokens?.map((token, idx) => (
            <Link
              key={`${token?.collection?.name}${idx}`}
              href={`/${token?.contract}/${token?.tokenId}`}
            >
              <a className="grid rounded-b-md group transition hover:shadow-lg bg-white dark:bg-black hover:-translate-y-0.5">
                <img
                  src={optimizeImage(token?.image, 250)}
                  alt={`${token?.collection?.name}`}
                  className="w-full"
                  width="250"
                  height="250"
                />
                <p className="text-lg mb-3 px-6 pt-4 lg:pt-3">{token?.name}</p>
                <div className="px-6 pb-4 lg:pb-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm text-neutral-500 dark:text-neutral-400 uppercase">
                      Offer
                    </div>
                    <div>
                      <FormatEth
                        amount={token?.topBuyValue}
                        maximumFractionDigits={2}
                        logoWidth={7}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-neutral-500 dark:text-neutral-400 uppercase">
                      Price
                    </div>
                    <div>
                      <FormatEth
                        amount={token?.floorSellValue}
                        maximumFractionDigits={2}
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
    </div>
  )
}

export default TokensGrid
