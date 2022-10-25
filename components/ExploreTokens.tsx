import { paths } from '@reservoir0x/reservoir-kit-client'
import FormatWEth from './FormatWEth'
import formatUrl from 'lib/formatUrl'
import { formatNumber } from 'lib/numbers'
import { optimizeImage } from 'lib/optmizeImage'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { FC } from 'react'
import { SWRInfiniteResponse } from 'swr/infinite/dist/infinite'
import ExploreTable from './ExploreTable'
import FormatEth from './FormatEth'

type Props = {
  viewRef: (node?: Element | null | undefined) => void
  attributes: SWRInfiniteResponse<
    paths['/collections/{collection}/attributes/explore/v2']['get']['responses']['200']['schema'],
    any
  >
}

const ExploreTokens: FC<Props> = ({ viewRef, attributes }) => {
  const router = useRouter()

  const { data, isValidating, size, error } = attributes

  const mappedAttributes = data
    ? data.flatMap(({ attributes }) => attributes)
    : []
  const isLoadingInitialData = !data && !error
  const isEmpty = mappedAttributes.length === 0
  const isReachingEnd =
    isEmpty || (data && data && data[data.length - 1]?.attributes?.length === 0)

  if (isLoadingInitialData) {
    return (
      <div className="mx-auto mb-10 max-w-[2400px]">
        <div className="mx-auto mb-5 grid max-w-[2400px] gap-5 sm:grid-cols-2 md:gap-7 lg:gap-8 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5">
          {Array(20)
            .fill(null)
            .map((_, index) => (
              <LoadingCard key={`loading-card-${index}`} />
            ))}
        </div>
      </div>
    )
  }

  if (!isEmpty) {
    return (
      <>
        {router.query?.view && router.query?.view.toString() === 'table' ? (
          <ExploreTable viewRef={viewRef} mappedAttributes={mappedAttributes} />
        ) : (
          <div className="mx-auto mb-10 max-w-[2400px]">
            <div className="mx-auto mb-5 grid max-w-[2400px] gap-5 sm:grid-cols-2 md:gap-7 lg:gap-8 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5">
              {mappedAttributes.map((attribute, idx, arr) => (
                <Link
                  key={`${attribute?.value}${idx}`}
                  href={
                    router.query.id
                      ? `/collections/${router.query.id}?${formatUrl(
                          `attributes[${attribute?.key}]`
                        )}=${formatUrl(`${attribute?.value}`)}`
                      : `?${formatUrl(
                          `attributes[${attribute?.key}]`
                        )}=${formatUrl(`${attribute?.value}`)}`
                  }
                >
                  <a
                    ref={idx === arr.length - 1 ? viewRef : null}
                    className="flex transform-gpu flex-col rounded-[16px] border border-[#D4D4D4] bg-white p-3 transition ease-in hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-lg hover:ease-out dark:border-neutral-800 dark:bg-black dark:hover:border-neutral-600 lg:p-6"
                  >
                    <div className="flex-grow"></div>
                    <ExploreImagesGrid
                      sample_images={attribute?.sampleImages}
                      // @ts-ignore
                      value={attribute?.value}
                    />
                    <div className="flex-grow"></div>
                    <div className="reservoir-subtitle mb-2 mt-2.5 flex items-baseline gap-2 dark:text-white lg:mt-4">
                      <span className="truncate" title={attribute?.value}>
                        {attribute?.value}
                      </span>
                      <span className="flex items-center justify-center rounded-full bg-neutral-200 px-2 dark:bg-neutral-800">
                        {formatNumber(attribute?.tokenCount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="grid">
                        <span className="reservoir-subtitle text-gray-400 dark:text-white">
                          Offer
                        </span>
                        <span className="reservoir-h6 font-headings dark:text-white">
                          <FormatWEth amount={attribute?.topBid?.value} />
                        </span>
                      </div>
                      <div className="grid text-right">
                        <span className="reservoir-subtitle text-gray-400">
                          Price
                        </span>
                        <span className="reservoir-h6 font-headings dark:text-white">
                          <FormatEth amount={attribute?.floorAskPrices?.[0]} />
                        </span>
                      </div>
                    </div>
                  </a>
                </Link>
              ))}
              {!isReachingEnd && (
                <>
                  {Array(20)
                    .fill(null)
                    .map((_, index) => {
                      if (index === 0) {
                        return <LoadingCard viewRef={viewRef} key={index} />
                      }
                      return <LoadingCard key={index} />
                    })}
                </>
              )}
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <div className="grid place-items-center gap-3">
      <p className="text-center">No tokens found.</p>
      <Link
        href={{
          pathname: '/collections/[id]',
          query: { id: router.query.id },
        }}
      >
        <a className="btn-primary-outline">Clear filters</a>
      </Link>
    </div>
  )
}

export default ExploreTokens

const LoadingCard = ({
  viewRef,
}: {
  viewRef?: (node?: Element | null | undefined) => void
}) => (
  <div
    ref={viewRef}
    className="grid h-[290px] animate-pulse rounded-md border border-neutral-300 bg-white dark:border-neutral-700 dark:bg-black"
  >
    <div className="mt-auto p-3">
      <div className="aspect-w-1 aspect-h-1 relative">
        <div className="mb-3 h-full bg-neutral-200 dark:bg-neutral-800"></div>
      </div>
      <div className="flex items-center justify-between py-2">
        <div className="h-5 w-[100px] rounded-md bg-neutral-200 dark:bg-neutral-800"></div>
        <div className="h-5 w-[40px] rounded-md bg-neutral-200 dark:bg-neutral-800"></div>
      </div>
      <div className="flex items-center justify-between py-2">
        <div className="space-y-2">
          <div className="h-3 w-[50px] rounded-md bg-neutral-200 dark:bg-neutral-800"></div>
          <div className="h-3 w-[50px] rounded-md bg-neutral-200 dark:bg-neutral-800"></div>
        </div>
        <div className="space-y-2">
          <div className="h-3 w-[50px] rounded-md bg-neutral-200 dark:bg-neutral-800"></div>
          <div className="h-3 w-[50px] rounded-md bg-neutral-200 dark:bg-neutral-800"></div>
        </div>
      </div>
    </div>
  </div>
)

const ExploreImagesGrid = ({
  sample_images,
  value,
}: {
  sample_images: NonNullable<
    paths['/collections/{collection}/attributes/explore/v2']['get']['responses']['200']['schema']['attributes']
  >[0]['sampleImages']
  value: NonNullable<
    paths['/collections/{collection}/attributes/explore/v2']['get']['responses']['200']['schema']['attributes']
  >[0]['value']
}) => (
  <>
    {!!sample_images && sample_images.length > 0 ? (
      <div className="flex gap-2">
        {sample_images.length > 1 ? (
          // SMALLER IMAGE, HAS SIDE IMAGES
          <Image
            loader={({ src }) => src}
            src={optimizeImage(
              sample_images[0],
              window?.innerWidth < 639
                ? 367
                : window?.innerWidth < 767
                ? 210
                : window?.innerWidth < 1023
                ? 284
                : window?.innerWidth < 1279
                ? 221
                : window?.innerWidth < 1535
                ? 196
                : 170
            )}
            alt={`${value}`}
            className={`${sample_images.length > 1 ? 'w-[75%]' : 'w-full'}`}
            width={250}
            height={250}
            objectFit="cover"
          />
        ) : (
          <Image
            loader={({ src }) => src}
            src={optimizeImage(
              sample_images[0],
              window?.innerWidth < 639
                ? 490
                : window?.innerWidth < 767
                ? 275
                : window?.innerWidth < 1023
                ? 378
                : window?.innerWidth < 1279
                ? 294
                : window?.innerWidth < 1535
                ? 261
                : 226
            )}
            alt={`${value}`}
            className={`${sample_images.length > 1 ? 'w-[75%]' : 'w-full'}`}
            width={300}
            height={300}
            objectFit="cover"
          />
        )}
        {sample_images.length > 1 && (
          <div className="w-[25%] space-y-2">
            {sample_images.slice(1).map((image) => (
              <Image
                key={image}
                loader={({ src }) => src}
                src={optimizeImage(
                  image,
                  window?.innerWidth < 639
                    ? 123
                    : window?.innerWidth < 767
                    ? 69
                    : window?.innerWidth < 1023
                    ? 95
                    : window?.innerWidth < 1279
                    ? 74
                    : window?.innerWidth < 1535
                    ? 66
                    : 66
                )}
                alt={`${value}`}
                className="w-full"
                width={70}
                height={70}
                objectFit="cover"
              />
            ))}
          </div>
        )}
      </div>
    ) : (
      <div className="aspect-w-1 aspect-h-1 relative">
        <div className="h-[250px] w-[250px]"></div>
      </div>
    )}
  </>
)
