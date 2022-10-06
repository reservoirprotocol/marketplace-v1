import { ComponentProps, FC, useEffect } from 'react'
import { DateTime } from 'luxon'
import Link from 'next/link'
import { optimizeImage } from 'lib/optmizeImage'
import { useSigner } from 'wagmi'
import Toast from 'components/Toast'
import CancelListing from 'components/CancelListing'
import FormatCrypto from 'components/FormatCrypto'
import useCoinConversion from 'hooks/useCoinConversion'
import { formatDollar } from 'lib/numbers'
import { useListings } from '@reservoir0x/reservoir-kit-ui'
import { useInView } from 'react-intersection-observer'
import { useRouter } from 'next/router'
import * as Dialog from '@radix-ui/react-dialog'

const API_BASE =
  process.env.NEXT_PUBLIC_RESERVOIR_API_BASE || 'https://api.reservoir.tools'

type Props = {
  collectionIds?: string[]
  modal: {
    isInTheWrongNetwork: boolean | undefined
    setToast: (data: ComponentProps<typeof Toast>['data']) => any
  }
}

const UserListingsTable: FC<Props> = ({ modal, collectionIds }) => {
  const router = useRouter()
  const { address } = router.query
  const params: Parameters<typeof useListings>['0'] = {
    maker: address as string,
    includeMetadata: true,
  }
  if (collectionIds) {
    params.contracts = collectionIds
  }

  const { data: listings, fetchNextPage, mutate } = useListings(params)

  const { ref, inView } = useInView()

  useEffect(() => {
    if (inView) {
      fetchNextPage()
    }
  }, [inView])

  if (listings.length === 0) {
    return (
      <div className="mt-14 grid justify-center dark:text-white">
        You don&apos;t have any items listed for sale.
      </div>
    )
  }

  return (
    <div className="mb-11 overflow-x-auto">
      <table className="min-w-full table-auto dark:divide-neutral-600">
        <thead className="bg-white dark:bg-black">
          <tr>
            {['Item', 'Price', 'Expiration', 'Marketplace'].map((item) => (
              <th
                key={item}
                scope="col"
                className="px-6 py-3 text-left text-sm font-medium text-neutral-600 dark:text-white"
              >
                {item}
              </th>
            ))}
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Edit</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {listings.map((listing, index, arr) => (
            <UseListingsTableRow
              key={`${listing?.id}-${index}`}
              ref={index === arr.length - 5 ? ref : null}
              listing={listing}
              modal={modal}
              mutate={mutate}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

type UserListingsTableRowProps = {
  listing: ReturnType<typeof useListings>['data'][0]
  modal: Props['modal']
  mutate: ReturnType<typeof useListings>['mutate']
  ref: null | ((node?: Element | null) => void)
}

const UseListingsTableRow = ({
  listing,
  modal,
  mutate,
  ref,
}: UserListingsTableRowProps) => {
  const { data: signer } = useSigner()
  const usdConversion = useCoinConversion(
    listing?.price?.currency?.symbol ? 'usd' : undefined,
    listing?.price?.currency?.symbol
  )

  const usdPrice =
    usdConversion && listing?.price?.amount?.decimal
      ? usdConversion * listing?.price?.amount?.decimal
      : null

  const {
    collectionName,
    contract,
    expiration,
    id,
    image,
    name,
    tokenHref,
    tokenId,
    price,
    source,
  } = processListing(listing)

  return (
    <tr
      ref={ref}
      className="group h-[80px] border-b-[1px] border-solid border-b-neutral-300 bg-white dark:border-b-neutral-600 dark:bg-black"
    >
      {/* ITEM */}
      <td className="whitespace-nowrap px-6 py-4 dark:text-white">
        <Link href={tokenHref}>
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
                {name}
              </div>
              <div className="text-xs text-neutral-600 dark:text-neutral-300">
                {collectionName}
              </div>
            </span>
          </a>
        </Link>
      </td>

      {/* PRICE */}
      <td className="whitespace-nowrap px-6 py-4 dark:text-white">
        <FormatCrypto
          amount={price?.amount?.decimal}
          address={price?.currency?.contract}
          decimals={price?.currency?.decimals}
        />
        {usdPrice && (
          <div className="text-sm text-neutral-600 dark:text-neutral-300">
            {formatDollar(usdPrice)}
          </div>
        )}
      </td>

      {/* EXPIRATION */}
      <td className="px-6 py-4 font-light text-neutral-600 dark:text-neutral-300">
        {expiration}
      </td>

      {/* MARKETPLACE */}
      <td className="whitespace-nowrap px-6 py-4">
        <a
          href={source.link || '#'}
          target="_blank"
          rel="noreferrer"
          className="flex gap-1 font-light text-primary-700 dark:text-primary-300"
        >
          {source.icon && (
            <img className="h-6 w-6" alt="Source Icon" src={source.icon} />
          )}
          <span className="max-w-[200px] overflow-hidden text-ellipsis">
            {source.name}
          </span>
        </a>
      </td>

      <td className="sticky top-0 right-0 whitespace-nowrap dark:text-white">
        <div className="flex items-center">
          <CancelListing
            data={{
              id,
              contract,
              tokenId,
            }}
            signer={signer}
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
    </tr>
  )
}

export default UserListingsTable

function processListing(listing: ReturnType<typeof useListings>['data'][0]) {
  const tokenId = listing?.tokenSetId?.split(':')[2]
  const contract = listing?.tokenSetId?.split(':')[1]
  const collectionRedirectUrl = `${API_BASE}/redirect/collections/${listing?.contract}/image/v1`

  const data = {
    contract,
    tokenId,
    image: listing?.metadata?.data?.image || collectionRedirectUrl,
    name: listing?.metadata?.data?.tokenName,
    expiration:
      listing?.expiration === 0
        ? 'Never'
        : DateTime.fromMillis(+`${listing?.expiration}000`).toRelative(),
    id: listing?.id,
    collectionName: listing?.metadata?.data?.collectionName,
    price: listing?.price,
    source: {
      icon: (listing?.source?.icon as string) || null,
      name: (listing?.source?.name as string) || null,
      link:
        listing?.source?.domain && tokenId
          ? `${API_BASE}/redirect/sources/${listing?.source?.domain}/tokens/${contract}:${tokenId}/link/v2`
          : `https://${listing?.source?.domain as string}` || null,
    },
  }

  const tokenHref = `/${data.contract}/${data.tokenId}`

  return { ...data, tokenHref }
}
