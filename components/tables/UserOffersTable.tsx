import { ComponentProps, FC, useEffect } from 'react'
import { DateTime } from 'luxon'
import Link from 'next/link'
import { optimizeImage } from 'lib/optmizeImage'
import CancelOffer from 'components/CancelOffer'
import { useAccount, useSigner } from 'wagmi'
import Toast from 'components/Toast'
import FormatCrypto from 'components/FormatCrypto'
import { useBids, useCollections } from '@reservoir0x/reservoir-kit-ui'
import { useInView } from 'react-intersection-observer'
import * as Dialog from '@radix-ui/react-dialog'
import { useRouter } from 'next/router'
import { formatNumber } from 'lib/numbers'

const API_BASE =
  process.env.NEXT_PUBLIC_RESERVOIR_API_BASE || 'https://api.reservoir.tools'

type Props = {
  isOwner: boolean
  collectionIds?: string[]
  mutate: () => any
  modal: {
    accountData: ReturnType<typeof useAccount>
    collectionId: string | undefined
    isInTheWrongNetwork: boolean | undefined
    setToast: (data: ComponentProps<typeof Toast>['data']) => any
    signer: ReturnType<typeof useSigner>['data']
  }
}

const UserOffersTable: FC<Props> = ({
  mutate,
  modal,
  isOwner,
  collectionIds,
}) => {
  const router = useRouter()
  const { address } = router.query
  const params: Parameters<typeof useBids>[0] = {
    status: 'active',
    maker: address as string,
    limit: 20,
    includeMetadata: true,
  }

  if (collectionIds) {
    params.contracts = collectionIds
  }

  const data = useBids(params)
  const bidCollectionIds = data.data.reduce((ids, bid) => {
    let contract = bid?.tokenSetId?.split(':')[1]
    if (contract && !ids.includes(contract)) {
      ids.push(contract)
    }
    return ids
  }, [] as string[])
  const bidCollections = useCollections(
    bidCollectionIds && {
      contract: bidCollectionIds,
    }
  )
  const floorPrices =
    bidCollections?.data?.reduce((prices, collection) => {
      if (
        collection.id &&
        collection.floorAsk?.price?.amount?.decimal !== null &&
        collection.floorAsk?.price?.amount?.decimal !== undefined
      ) {
        prices[collection.id] = collection.floorAsk?.price?.amount?.decimal
      }
      return prices
    }, {} as { [key: string]: number }) || ({} as { [key: string]: number })

  const { ref, inView } = useInView()
  useEffect(() => {
    if (inView && data.hasNextPage) {
      data.fetchNextPage()
    }
  }, [inView])
  const bids = data.data

  if (bids.length === 0) {
    return (
      <div className="reservoir-body mt-14 grid justify-center dark:text-white">
        You have not made any offers.
      </div>
    )
  }

  return (
    <div className="mb-11 overflow-x-auto">
      <table className="min-w-full table-auto">
        <thead>
          <tr>
            {[
              'Item',
              'Offer',
              'Floor Difference',
              'Expiration',
              'Marketplace',
            ].map((item) => (
              <th
                key={item}
                scope="col"
                className="px-6 py-3 text-left text-sm font-medium text-neutral-600 dark:text-white"
              >
                {item}
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
              id,
              key,
              href,
              image,
              tokenName,
              tokenId,
              price,
              value,
              source,
              floorPriceDiff,
            } = processBid(bid, floorPrices)

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
                        {tokenName && (
                          <div className="dark:text-solid-300 text-xs text-neutral-600">
                            {collectionName}
                          </div>
                        )}
                        <div>
                          <span className="dark:text-solid-300 text-xs text-neutral-600">
                            {key} {value}
                          </span>
                        </div>
                      </span>
                    </a>
                  </Link>
                </td>

                {/* OFFER */}
                <td className="whitespace-nowrap px-6 py-4 text-black dark:text-white">
                  <FormatCrypto
                    amount={price?.amount?.decimal}
                    address={price?.currency?.contract}
                    decimals={price?.currency?.decimals}
                  />
                </td>

                {/* FLOOR DIFFERENCE */}
                <td className="dark:text-solid-300 whitespace-nowrap px-6 py-4 font-light text-neutral-600">
                  {floorPriceDiff && floorPriceDiff !== 0
                    ? `${formatNumber(Math.abs(floorPriceDiff))}% ${
                        floorPriceDiff > 0 ? 'above' : 'below'
                      }`
                    : '--'}
                </td>

                {/* EXPIRATION */}
                <td className="dark:text-solid-300 whitespace-nowrap px-6 py-4 font-light text-neutral-600">
                  {expiration}
                </td>

                {/* MARKETPLACE */}
                <td className="whitespace-nowrap px-6 py-4">
                  <a
                    href={source.link || ''}
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
                </td>

                {isOwner && (
                  <td className="sticky top-0 right-0 whitespace-nowrap dark:text-white">
                    <div className="flex items-center">
                      <CancelOffer
                        data={{
                          id,
                          contract,
                          tokenId,
                        }}
                        signer={modal.signer}
                        show={true}
                        isInTheWrongNetwork={modal.isInTheWrongNetwork}
                        setToast={modal.setToast}
                        mutate={mutate}
                        trigger={
                          <Dialog.Trigger className="btn-primary-outline min-w-[120px] bg-white py-[3px] text-sm text-[#FF3B3B] dark:border-neutral-600 dark:bg-black dark:text-[#FF9A9A] dark:ring-primary-900 dark:focus:ring-4">
                            Cancel
                          </Dialog.Trigger>
                        }
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

export default UserOffersTable

function processBid(
  bid: ReturnType<typeof useBids>['data']['0'],
  floorPrices: { [key: string]: number }
) {
  const kind = bid?.metadata?.kind
  // @ts-ignore
  const key = bid?.metadata?.data?.attributes?.[0]?.key
  // @ts-ignore
  const value = bid?.metadata?.data?.attributes?.[0]?.value
  let tokenId
  let contract = bid?.tokenSetId?.split(':')[1]
  let href
  const collectionRedirectUrl = `${API_BASE}/redirect/collections/${contract}/image/v1`
  const bidPrice =
    bid?.price?.amount?.decimal !== undefined &&
    bid?.price?.amount?.decimal !== null
      ? bid?.price?.amount?.decimal
      : 0
  const floorPriceDiff =
    contract && floorPrices[contract] !== undefined
      ? ((bidPrice - floorPrices[contract]) /
          ((bidPrice + floorPrices[contract]) / 2)) *
        100
      : null

  switch (kind) {
    case 'token':
      tokenId = bid?.tokenSetId?.split(':')[2]
      href = `/${contract}/${tokenId}`
      break
    // @ts-ignore
    case 'attribute':
      tokenId = undefined
      href = `/collections/${contract}?attributes[${key}]=${value}`
      break
    // @ts-ignore
    case 'collection':
      tokenId = undefined
      href = `/collections/${contract}`
      break

    default:
      break
  }

  const data = {
    key,
    value,
    kind,
    contract,
    tokenId,
    image: bid?.metadata?.data?.image || collectionRedirectUrl,
    tokenName: bid?.metadata?.data?.tokenName || `#${tokenId}`,
    expiration:
      bid?.expiration === 0
        ? 'Never'
        : DateTime.fromMillis(+`${bid?.expiration}000`).toRelative(),
    id: bid?.id,
    collectionName: bid?.metadata?.data?.collectionName,
    price: bid?.price,
    source: {
      icon: (bid?.source?.icon as string) || null,
      name: (bid?.source?.name as string) || null,
      link:
        bid?.source?.domain && tokenId
          ? `${API_BASE}/redirect/sources/${bid?.source?.domain}/tokens/${contract}:${tokenId}/link/v2`
          : (bid?.source?.domain as string) || null,
    },
    floorPriceDiff,
  }

  return { ...data, href }
}
