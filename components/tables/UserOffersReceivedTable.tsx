import { ComponentProps, FC, useEffect } from 'react'
import { DateTime } from 'luxon'
import Link from 'next/link'
import { optimizeImage } from 'lib/optmizeImage'
import Toast from 'components/Toast'
import { useUserTopBids, AcceptBidModal } from '@reservoir0x/reservoir-kit-ui'
import { useInView } from 'react-intersection-observer'
import { useRouter } from 'next/router'
import LoadingIcon from 'components/LoadingIcon'
import { truncateAddress } from 'lib/truncateText'
import useCoinConversion from 'hooks/useCoinConversion'
import { formatDollar, formatNumber } from 'lib/numbers'
import FormatWEth from 'components/FormatWEth'
import InfoTooltip from 'components/InfoTooltip'
import { useMediaQuery } from '@react-hookz/web'
import FormatNativeCrypto from 'components/FormatNativeCrypto'
import Tooltip from 'components/Tooltip'

const API_BASE =
  process.env.NEXT_PUBLIC_RESERVOIR_API_BASE || 'https://api.reservoir.tools'

type Props = {
  isOwner: boolean
  collectionIds?: string[]
  modal: {
    isInTheWrongNetwork: boolean | undefined
    setToast: (data: ComponentProps<typeof Toast>['data']) => any
  }
}

const UserOffersReceivedTable: FC<Props> = ({
  modal,
  isOwner,
  collectionIds,
}) => {
  const router = useRouter()
  const { address } = router.query
  const params: Parameters<typeof useUserTopBids>[1] = {
    limit: 20,
  }
  const usdConversion = useCoinConversion('usd')
  const isMobile = useMediaQuery('only screen and (max-width : 730px)')

  if (collectionIds) {
    collectionIds.forEach((id, i) => {
      //@ts-ignore
      params[`collection[${i}]`] = id
    })
  }

  const data = useUserTopBids(address as string, params, {
    revalidateOnMount: false,
  })

  useEffect(() => {
    data.mutate()
    return () => {
      data.setSize(1)
    }
  }, [])

  const { ref, inView } = useInView()
  useEffect(() => {
    if (inView && data.hasNextPage) {
      data.fetchNextPage()
    }
  }, [inView])
  const bids = data.data

  const onBidAcceptError = (error: any) => {
    if (error?.type === 'price mismatch') {
      modal.setToast({
        kind: 'error',
        message: 'Offer was lower than expected.',
        title: 'Could not accept offer',
      })
      return
    }
    // Handle user rejection
    if (error?.code === 4001) {
      modal.setToast({
        kind: 'error',
        message: 'You have canceled the transaction.',
        title: 'User canceled transaction',
      })
      return
    }
    modal.setToast({
      kind: 'error',
      message: 'The transaction was not completed.',
      title: 'Could not accept offer',
    })
  }

  if (data.isFetchingInitialData) {
    return (
      <div className="my-20 flex justify-center">
        <LoadingIcon />
      </div>
    )
  }

  if (bids.length === 0) {
    return (
      <div className="mt-14 grid justify-center dark:text-white">
        You have not received any offers.
      </div>
    )
  }

  if (isMobile) {
    return (
      <div className="mb-11 overflow-x-auto">
        {bids?.map((bid, index, arr) => {
          const {
            collectionName,
            contract,
            expiration,
            href,
            image,
            tokenName,
            tokenId,
            price,
            source,
            floorDifference,
            maker,
          } = processBid(bid)

          return (
            <div
              key={`${contract}-${index}`}
              className="border-b-[1px] border-solid border-b-neutral-300	py-[16px]"
              ref={index === arr.length - 5 ? ref : null}
            >
              <div className="flex items-center justify-between">
                <Link href={href || '#'}>
                  <a className="flex items-center gap-2">
                    <div className="relative h-14 w-14">
                      {image && (
                        <div className="aspect-w-1 aspect-h-1 relative overflow-hidden rounded">
                          <img
                            src={optimizeImage(image, 56)}
                            alt="Bid Image"
                            className="w-[56px] object-contain"
                            width="56"
                            height="56"
                          />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="reservoir-h6 max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap font-headings text-sm dark:text-white">
                        {tokenName ? tokenName : collectionName}
                      </div>
                      {tokenName && (
                        <div className="max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap text-xs text-neutral-600 dark:text-neutral-300">
                          {collectionName}
                        </div>
                      )}
                    </div>
                  </a>
                </Link>
                <div className="flex flex-col">
                  <FormatWEth amount={price} />
                  {usdConversion && (
                    <span className="mt-1 text-right text-xs text-neutral-600 dark:text-neutral-300">
                      {formatDollar(usdConversion * (price || 0))}
                    </span>
                  )}
                  <span className="text-right text-xs font-light text-neutral-400 dark:text-neutral-300">
                    {floorDifference}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4">
                <div>
                  <div className="flex items-center gap-1 text-xs font-light text-neutral-600 dark:text-neutral-300">
                    From{' '}
                    <a
                      href={`/address/${maker}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex gap-1 font-light text-primary-700 dark:text-primary-300"
                    >
                      {truncateAddress(maker)}
                    </a>{' '}
                    via{' '}
                    <a
                      href={source.link || '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 font-light text-primary-700 dark:text-primary-300"
                    >
                      {source.icon && (
                        <img
                          className="h-6 w-6"
                          alt="Source Icon"
                          src={source.icon}
                        />
                      )}
                      <span className="max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap text-xs">
                        {source.name}
                      </span>
                    </a>
                  </div>
                  <div className="text-xs font-light text-neutral-600 dark:text-neutral-300">{`Expires ${expiration}`}</div>
                </div>
                <AcceptBidModal
                  trigger={
                    <button className="btn-primary-outline min-w-[120px] bg-white py-[3px] text-sm text-black dark:border-neutral-600 dark:bg-black dark:text-white dark:ring-primary-900 dark:focus:ring-4">
                      Accept
                    </button>
                  }
                  collectionId={contract}
                  tokenId={tokenId}
                  onClose={() => data.mutate()}
                  onBidAcceptError={onBidAcceptError}
                />
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="mb-11 overflow-x-auto">
      <table className="min-w-full table-auto">
        <thead>
          <tr>
            {[
              {
                title: 'Item',
                tooltip: null,
              },
              {
                title: 'Top Offer',
                tooltip: 'We show you the best offer available per token',
              },
              {
                title: 'Floor Price',
                tooltip: null,
              },
              {
                title: 'Expiration',
                tooltip: null,
              },
              {
                title: 'Marketplace',
                tooltip: null,
              },
            ].map((item, i) => (
              <th
                key={i}
                scope="col"
                className="px-6 py-3 text-left text-sm font-medium text-neutral-600 dark:text-white"
              >
                <div className="flex gap-1">
                  {item.title}
                  {item.tooltip && (
                    <InfoTooltip
                      side="top"
                      width={200}
                      content={item.tooltip}
                    />
                  )}
                </div>
              </th>
            ))}
            {isOwner && (
              <th
                scope="col"
                className="relative px-6 py-3 text-sm font-medium text-neutral-600 dark:text-white"
              >
                <span className="sr-only">Cancel</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {bids?.map((bid, index, arr) => {
            const {
              collectionName,
              contract,
              expiration,
              href,
              image,
              tokenName,
              tokenId,
              price,
              netValue,
              feeBreakdown,
              floorAskPrice,
              floorDifference,
              source,
              maker,
            } = processBid(bid)

            return (
              <tr
                key={`${contract}-${index}`}
                ref={index === arr.length - 5 ? ref : null}
                className="group h-[80px] border-b-[1px] border-solid border-b-neutral-300 bg-white dark:border-b-neutral-600 dark:bg-black"
              >
                {/* ITEM */}
                <td className="whitespace-nowrap px-6 py-4">
                  <Link href={href || '#'}>
                    <a className="flex items-center gap-2">
                      <div className="relative h-16 w-16">
                        {image && (
                          <div className="aspect-w-1 aspect-h-1 relative overflow-hidden rounded">
                            <img
                              src={optimizeImage(image, 64)}
                              alt="Bid Image"
                              className="w-[64px] object-contain"
                              width="64"
                              height="64"
                            />
                          </div>
                        )}
                      </div>
                      <span className="whitespace-nowrap">
                        <div className="reservoir-h6 max-w-[250px] overflow-hidden text-ellipsis font-headings text-base dark:text-white">
                          {tokenName ? tokenName : collectionName}
                        </div>
                        <div className="text-xs text-neutral-600 dark:text-neutral-300">
                          {collectionName}
                        </div>
                      </span>
                    </a>
                  </Link>
                </td>

                {/* OFFER */}
                <td className="whitespace-nowrap px-6 py-4 text-black dark:text-white">
                  <Tooltip
                    side="top"
                    content={
                      <div className="flex min-w-[150px] flex-col gap-2">
                        <div className="flex justify-between gap-1 text-xs text-neutral-100">
                          <div>Top Offer</div>
                          <FormatWEth
                            amount={price}
                            maximumFractionDigits={8}
                          />
                        </div>

                        {feeBreakdown?.map((fee, i) => (
                          <div
                            key={i}
                            className="flex justify-between gap-2 text-xs text-neutral-400"
                          >
                            {fee.kind === 'royalty' && <div>Royalty</div>}
                            {fee.kind === 'marketplace' && (
                              <div>Marketplace</div>
                            )}
                            <div className="flex items-center gap-1">
                              -
                              <FormatWEth
                                amount={price * ((fee?.bps || 0) / 10000)}
                                maximumFractionDigits={8}
                              />
                            </div>
                          </div>
                        ))}
                        <div className="flex justify-between gap-2 text-xs text-neutral-100">
                          <div>You Get</div>
                          <FormatWEth
                            amount={netValue}
                            maximumFractionDigits={8}
                          />
                        </div>
                      </div>
                    }
                  >
                    <div className="flex flex-col">
                      <FormatWEth amount={price} maximumFractionDigits={8} />
                      {usdConversion && (
                        <span className="mt-1 text-xs text-neutral-600 dark:text-neutral-300">
                          {formatDollar(usdConversion * (price || 0))}
                        </span>
                      )}
                    </div>
                  </Tooltip>
                </td>

                {/* FlOOR DIFFERENCE */}
                <td className="whitespace-nowrap px-6 py-4 font-light text-neutral-600 dark:text-neutral-300">
                  <div className="flex flex-col">
                    {floorAskPrice ? (
                      <FormatNativeCrypto amount={floorAskPrice} />
                    ) : (
                      '-'
                    )}
                    {floorAskPrice ? (
                      <span className="text-xs text-neutral-600 dark:text-neutral-300">
                        {floorDifference}
                      </span>
                    ) : null}
                  </div>
                </td>

                {/* EXPIRATION */}
                <td className="whitespace-nowrap px-6 py-4 font-light text-neutral-600 dark:text-neutral-300">
                  {expiration}
                </td>

                {/* MARKETPLACE */}
                <td className="whitespace-nowrap px-6 py-4">
                  <a
                    href={`/address/${maker}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex gap-1 font-light text-primary-700 dark:text-primary-300"
                  >
                    {truncateAddress(maker)}
                  </a>
                  <div className="mt-1 flex gap-1">
                    <span className="font-light text-neutral-600 dark:text-neutral-300">
                      via
                    </span>
                    <a
                      href={source.link || '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="flex gap-1 font-light text-primary-700 dark:text-primary-300"
                    >
                      {source.icon && (
                        <img
                          className="h-6 w-6"
                          alt="Source Icon"
                          src={source.icon}
                        />
                      )}
                      <span className="max-w-[200px] overflow-hidden text-ellipsis">
                        {source.name}
                      </span>
                    </a>
                  </div>
                </td>

                {isOwner && (
                  <td className="sticky top-0 right-0 whitespace-nowrap dark:text-white">
                    <div className="flex items-center">
                      <AcceptBidModal
                        trigger={
                          <button className="btn-primary-outline min-w-[120px] bg-white py-[3px] text-sm text-black dark:border-neutral-600 dark:bg-black dark:text-white dark:ring-primary-900 dark:focus:ring-4">
                            Accept
                          </button>
                        }
                        collectionId={contract}
                        tokenId={tokenId}
                        onClose={() => data.mutate()}
                        onBidAcceptError={onBidAcceptError}
                      />
                    </div>
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default UserOffersReceivedTable

function processBid(bid: ReturnType<typeof useUserTopBids>['data']['0']) {
  const tokenId = bid?.token?.tokenId
  const contract = bid?.token?.collection?.id
  const href = `/${contract}/${tokenId}`
  const collectionRedirectUrl = `${API_BASE}/redirect/collections/${bid?.token?.collection?.name}/image/v1`
  const price = bid?.price || 0
  const floorAskPrice = bid?.token?.collection?.floorAskPrice || 0
  const floorDifference = floorAskPrice
    ? ((price - floorAskPrice) / ((price + floorAskPrice) / 2)) * 100
    : 0

  const data = {
    contract,
    tokenId,
    image: bid?.token?.image || collectionRedirectUrl,
    tokenName: bid?.token?.name || `#${bid?.token?.tokenId}` || undefined,
    expiration:
      bid?.validUntil === 0
        ? 'Never'
        : DateTime.fromMillis(+`${bid?.validUntil}000`).toRelative(),
    collectionName: bid?.token?.collection?.name,
    price: price,
    netValue: bid?.value,
    feeBreakdown: bid?.feeBreakdown,
    source: {
      icon: (bid?.source?.icon as string) || null,
      name: (bid?.source?.name as string) || null,
      link: (bid?.source?.url as string) || null,
    },
    floorAskPrice,
    floorDifference: floorDifference
      ? `${formatNumber(Math.abs(floorDifference))}% ${
          floorDifference > 0 ? 'above the floor' : 'below the floor'
        }`
      : '-',
    maker: bid?.maker || '',
  }

  return { ...data, href }
}
