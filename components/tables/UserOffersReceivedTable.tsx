import { ComponentProps, FC, useEffect } from 'react'
import { DateTime } from 'luxon'
import Link from 'next/link'
import { optimizeImage } from 'lib/optmizeImage'
import Toast from 'components/Toast'
import {
  useUserTopBids,
  useReservoirClient,
} from '@reservoir0x/reservoir-kit-ui'
import { useInView } from 'react-intersection-observer'
import { useRouter } from 'next/router'
import LoadingIcon from 'components/LoadingIcon'
import { useSigner } from 'wagmi'
import { truncateAddress } from 'lib/truncateText'
import useCoinConversion from 'hooks/useCoinConversion'
import { formatDollar } from 'lib/numbers'
import FormatWEth from 'components/FormatWEth'
import InfoTooltip from 'components/InfoTooltip'

const API_BASE =
  process.env.NEXT_PUBLIC_RESERVOIR_API_BASE || 'https://api.reservoir.tools'

type Props = {
  isOwner: boolean
  collectionIds?: string[]
  mutate: () => any
  modal: {
    isInTheWrongNetwork: boolean | undefined
    setToast: (data: ComponentProps<typeof Toast>['data']) => any
  }
}

const UserOffersReceivedTable: FC<Props> = ({
  mutate,
  modal,
  isOwner,
  collectionIds,
}) => {
  const { data: signer } = useSigner()
  const reservoirClient = useReservoirClient()
  const router = useRouter()
  const { address } = router.query
  const params: Parameters<typeof useUserTopBids>[1] = {
    limit: 20,
  }
  const usdConversion = useCoinConversion('usd')

  if (collectionIds) {
    collectionIds.forEach((id, i) => {
      //@ts-ignore
      params[`collection[${i}]`] = id
    })
  }

  const data = useUserTopBids(address as string, params)

  useEffect(() => {
    data.setSize(1)
  }, [])

  const { ref, inView } = useInView()
  useEffect(() => {
    if (inView && data.hasNextPage) {
      data.fetchNextPage()
    }
  }, [inView])
  const bids = data.data

  if (data.isFetchingInitialData) {
    return (
      <div className="my-20 flex justify-center">
        <LoadingIcon />
      </div>
    )
  }

  if (bids.length === 0) {
    return (
      <div className="reservoir-body mt-14 grid justify-center dark:text-white">
        You have not received any offers.
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
                title: 'Best Offer',
                tooltip: 'We show you the best offer available per token',
              },
              {
                title: 'You Get',
                tooltip: 'The amount you get deducting all fees',
              },
              {
                title: 'Floor Difference',
                tooltip:
                  'The percentage difference between an offer price and the floor price',
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
              floorDifference,
              source,
              maker,
            } = processBid(bid)

            return (
              <tr
                key={`${contract}-${index}`}
                ref={index === arr.length - 5 ? ref : null}
                className="group h-[80px] bg-white dark:bg-neutral-900"
              >
                {/* ITEM */}
                <td className="whitespace-nowrap px-6 py-4 ">
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
                  <div className="flex flex-col">
                    <FormatWEth amount={price} />
                    <span className="mt-1 text-xs text-neutral-600 dark:text-neutral-300">
                      {formatDollar(usdConversion * (price || 0))}
                    </span>
                  </div>
                </td>

                {/* OFFER NET */}
                <td className="whitespace-nowrap px-6 py-4 text-black dark:text-white">
                  <div className="flex flex-col">
                    <FormatWEth amount={netValue} />
                    <span className="mt-1 text-xs text-neutral-600 dark:text-neutral-300">
                      {formatDollar(usdConversion * (netValue || 0))}
                    </span>
                  </div>
                </td>

                {/* FlOOR DIFFERENCE */}
                <td className="whitespace-nowrap px-6 py-4 font-light text-neutral-600 dark:text-neutral-300">
                  {floorDifference ? floorDifference : '--'}
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
                    className="flex gap-1 font-light text-primary-700"
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
                      className="flex gap-1 font-light text-primary-700"
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
                      <button
                        className="btn-primary-outline min-w-[120px] bg-white py-[3px] text-sm text-[#FF3B3B] dark:border-neutral-600 dark:bg-black dark:text-[#FF9A9A] dark:ring-primary-900 dark:focus:ring-4"
                        onClick={() => {
                          if (!signer) {
                            throw 'Missing a signer'
                          }

                          reservoirClient?.actions.acceptOffer({
                            signer: signer,
                            token: {
                              tokenId: tokenId as string,
                              contract: contract as string,
                            },
                            options: {
                              orderId: bid?.id as string,
                            },
                            onProgress: (steps) => {
                              const error = steps.find((step) => step.error)
                              if (error) {
                                modal.setToast({
                                  kind: 'error',
                                  message: 'The transaction was not completed.',
                                  title: 'Could not accept offer',
                                })
                              } else {
                                const allComplete = steps.every((step) =>
                                  step.items
                                    ? step.items.every(
                                        (item) => item.status === 'complete'
                                      )
                                    : true
                                )
                                if (allComplete) {
                                  mutate()
                                }
                              }
                            },
                          })
                        }}
                      >
                        Accept
                      </button>
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
  const floorAskPrice = bid?.token?.floorAskPrice || 0
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
    id: bid?.id,
    collectionName: bid?.token?.collection?.name,
    price: price,
    netValue: bid?.value,
    source: {
      icon: (bid?.source?.icon as string) || null,
      name: (bid?.source?.name as string) || null,
      link: (bid?.source?.url as string) || null,
    },
    floorDifference: floorDifference
      ? `${floorDifference}% ${floorDifference > 0 ? 'above' : 'below'}`
      : '--',
    maker: bid?.maker || '',
  }

  return { ...data, href }
}
