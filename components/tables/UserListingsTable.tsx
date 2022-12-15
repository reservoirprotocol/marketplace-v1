import {
  ComponentProps,
  Dispatch,
  FC,
  SetStateAction,
  useEffect,
  useState,
} from 'react'
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
import LoadingIcon from 'components/LoadingIcon'
import { useMediaQuery } from '@react-hookz/web'
import { FiAlertCircle } from 'react-icons/fi'

const API_BASE =
  process.env.NEXT_PUBLIC_RESERVOIR_API_BASE || 'https://api.reservoir.tools'

type Props = {
  isOwner: boolean
  collectionIds?: string[]
  modal: {
    isInTheWrongNetwork: boolean | undefined
    setToast: (data: ComponentProps<typeof Toast>['data']) => any
  }
  showActive?: boolean
}

const UserListingsTable: FC<Props> = ({
  modal,
  collectionIds,
  showActive,
  isOwner,
}) => {
  const router = useRouter()
  const isMobile = useMediaQuery('only screen and (max-width : 730px)')
  const { address } = router.query
  const params: Parameters<typeof useListings>['0'] = {
    maker: address as string,
    includeMetadata: true,
    status: showActive ? 'active' : 'inactive',
  }
  if (collectionIds) {
    params.contracts = collectionIds
  }

  const {
    data: listings,
    fetchNextPage,
    mutate,
    setSize,
    isFetchingInitialData,
  } = useListings(params, {
    revalidateOnMount: false,
  })
  const { ref, inView } = useInView()

  useEffect(() => {
    mutate()
    return () => {
      setSize(1)
    }
  }, [])

  useEffect(() => {
    if (inView) {
      fetchNextPage()
    }
  }, [inView])

  if (isFetchingInitialData) {
    return (
      <div className="my-20 flex justify-center">
        <LoadingIcon />
      </div>
    )
  }

  return (
    <div className="mb-11 overflow-x-auto">
      {!showActive && (
        <div className="flex items-center rounded-lg bg-[#F5F5F5] p-4 text-sm dark:bg-[#262626]">
          <FiAlertCircle className="mr-2 h-4 w-4 shrink-0 text-[#A3A3A3] dark:text-white" />
          <span>
            An inactive listing is a listing of your NFT that was never canceled
            and is still fulfillable should that item be returned to your
            wallet.
          </span>
        </div>
      )}
      {listings.length === 0 && (
        <div className="mt-14 flex flex-col items-center justify-center text-[#525252] dark:text-white">
          <img
            src="/icons/listing-icon.svg"
            alt="No listings"
            className="mb-10 dark:hidden"
          />
          <img
            src="/icons/listing-icon-dark.svg"
            alt="No listings"
            className="mb-10 hidden dark:block"
          />
          No {showActive ? 'active' : 'inactive'} listings yet
        </div>
      )}
      {isMobile
        ? listings.map((listing, index, arr) => (
            <UserListingsMobileRow
              key={`${listing?.id}-${index}`}
              ref={index === arr.length - 5 ? ref : null}
              listing={listing}
              modal={modal}
              mutate={mutate}
              isOwner={isOwner}
            />
          ))
        : listings.length > 0 && (
            <table className="min-w-full table-auto dark:divide-neutral-600">
              <thead className="bg-white dark:bg-black">
                <tr>
                  {['Item', 'Price', 'Expiration', 'Marketplace'].map(
                    (item) => (
                      <th
                        key={item}
                        scope="col"
                        className="px-6 py-3 text-left text-sm font-medium text-neutral-600 dark:text-white"
                      >
                        {item}
                      </th>
                    )
                  )}
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Cancel</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {listings.map((listing, index, arr) => (
                  <UserListingsTableRow
                    key={`${listing?.id}-${index}`}
                    ref={index === arr.length - 5 ? ref : null}
                    listing={listing}
                    modal={modal}
                    mutate={mutate}
                    isOwner={isOwner}
                  />
                ))}
              </tbody>
            </table>
          )}
    </div>
  )
}

type UserListingsRowProps = {
  isOwner: boolean
  listing: ReturnType<typeof useListings>['data'][0]
  modal: Props['modal']
  mutate: ReturnType<typeof useListings>['mutate']
  ref: null | ((node?: Element | null) => void)
}

const UserListingsTableRow = ({
  isOwner,
  listing,
  modal,
  mutate,
  ref,
}: UserListingsRowProps) => {
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
          maximumFractionDigits={8}
        />
        {usdPrice && (
          <div className="text-xs text-neutral-600 dark:text-neutral-300">
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
            show={isOwner}
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

const UserListingsMobileRow = ({
  isOwner,
  listing,
  modal,
  mutate,
  ref,
}: UserListingsRowProps) => {
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
    <div
      className="border-b-[1px] border-solid border-b-neutral-300	py-[16px]"
      ref={ref}
    >
      <div className="flex items-center justify-between">
        <Link href={tokenHref || '#'}>
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
                {name}
              </div>
              <div className="max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap text-xs text-neutral-600 dark:text-neutral-300">
                {collectionName}
              </div>
            </div>
          </a>
        </Link>
        <div className="flex flex-col">
          <FormatCrypto
            amount={price?.amount?.decimal}
            address={price?.currency?.contract}
            decimals={price?.currency?.decimals}
            maximumFractionDigits={8}
          />
          {usdPrice && (
            <span className="mt-1 text-right text-xs text-neutral-600 dark:text-neutral-300">
              {formatDollar(usdPrice)}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between pt-4">
        <div>
          <a
            href={source.link || '#'}
            target="_blank"
            rel="noreferrer"
            className="mb-1 flex items-center gap-1 font-light text-primary-700 dark:text-primary-300"
          >
            {source.icon && (
              <img className="h-6 w-6" alt="Source Icon" src={source.icon} />
            )}
            <span className="max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap text-xs">
              {source.name}
            </span>
          </a>
          <div className="text-xs font-light text-neutral-600 dark:text-neutral-300">{`Expires ${expiration}`}</div>
        </div>
        <CancelListing
          data={{
            id,
            contract,
            tokenId,
          }}
          signer={signer}
          show={isOwner}
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
    </div>
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
