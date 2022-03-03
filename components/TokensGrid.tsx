import { paths } from 'interfaces/apiTypes'
import { FC } from 'react'
import LoadingCard from './LoadingCard'
import { SWRInfiniteResponse } from 'swr/infinite/dist/infinite'
import Link from 'next/link'
import { optimizeImage } from 'lib/optmizeImage'
import { useInView } from 'react-intersection-observer'
import FormatEth from './FormatEth'

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
    <div className="mx-auto mb-5 grid max-w-[2400px] grid-cols-2 gap-5 md:grid-cols-3 md:gap-10 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
      {size === 1 && isValidating
        ? Array(20).map((_, index) => (
            <LoadingCard key={`loading-card-${index}`} />
          ))
        : mappedTokens?.map((token, idx) => (
            <Link
              key={`${token?.collection?.name}${idx}`}
              href={`/${token?.contract}/${token?.tokenId}`}
            >
              <a className="group grid self-start rounded-b-md bg-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg dark:bg-black">
                <img
                  src={optimizeImage(token?.image, 250)}
                  alt={`${token?.collection?.name}`}
                  className="w-full"
                  width="250"
                  height="250"
                />
                <p className="mb-3 overflow-hidden text-ellipsis px-6 pt-4 text-lg lg:pt-3">
                  {token?.name}
                </p>
                <div className="flex items-center justify-between px-6 pb-4 lg:pb-3">
                  <div>
                    <div className="text-sm uppercase text-neutral-500 dark:text-neutral-400">
                      Offer
                    </div>
                    <div>
                      <FormatEth
                        amount={token?.topBuyValue}
                        maximumFractionDigits={4}
                        logoWidth={7}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm uppercase text-neutral-500 dark:text-neutral-400">
                      Price
                    </div>
                    <div>
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
    </div>
  )
}

export default TokensGrid
