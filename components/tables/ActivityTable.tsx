import { optimizeImage } from 'lib/optmizeImage'
import { truncateAddress } from 'lib/truncateText'
import { DateTime } from 'luxon'
import Link from 'next/link'
import { FC, useEffect, useState } from 'react'
import Image from 'next/image'
import { useMediaQuery } from '@react-hookz/web'
import LoadingIcon from 'components/LoadingIcon'
import { FiExternalLink, FiRepeat, FiTrash2, FiXSquare } from 'react-icons/fi'
import useEnvChain from 'hooks/useEnvChain'
import { useAccount } from 'wagmi'
import { constants } from 'ethers'
import { FaSeedling } from 'react-icons/fa'
import FormatEth from 'components/FormatEth'
import { useCollectionActivity } from '@reservoir0x/reservoir-kit-ui'
import { useInView } from 'react-intersection-observer'

const RESERVOIR_API_BASE = process.env.NEXT_PUBLIC_RESERVOIR_API_BASE
type CollectionActivityResponse = ReturnType<typeof useCollectionActivity>
type CollectionActivity = CollectionActivityResponse['data'][0]
type UsersActivityResponse = ReturnType<typeof useCollectionActivity>
type UsersActivity = UsersActivityResponse['data'][0]
type ActivityResponse = CollectionActivityResponse | UsersActivityResponse
type Activity = CollectionActivity | UsersActivity

type Props = {
  data: ActivityResponse
}

const ActivityTable: FC<Props> = ({ data }) => {
  const headings = ['Event', 'Item', 'Amount', 'From', 'To', 'Time']
  const isMobile = useMediaQuery('only screen and (max-width : 730px)')

  const { ref, inView } = useInView()

  const activity = data.data

  useEffect(() => {
    if (inView) data.fetchNextPage()
  }, [inView])

  return (
    <>
      <table className="w-full">
        {!isMobile && (
          <thead>
            <tr className="text-left">
              {headings.map((name, i) => (
                <th
                  key={i}
                  className="px-6 py-3 text-left text-sm font-medium text-neutral-600 dark:text-white"
                >
                  {name}
                </th>
              ))}
            </tr>
          </thead>
        )}

        <tbody>
          {activity.map((sale) => {
            if (!sale) return null

            return <ActivityTableRow key={sale?.txHash} sale={sale} />
          })}
          <tr ref={ref}></tr>
        </tbody>
      </table>
      {data.isValidating && (
        <div className="my-20 flex justify-center">
          <LoadingIcon />
        </div>
      )}
    </>
  )
}

type ActivityTableRowProps = {
  sale: Activity
}

const ActivityTableRow: FC<ActivityTableRowProps> = ({ sale }) => {
  const isMobile = useMediaQuery('only screen and (max-width : 730px)')
  const { address } = useAccount()
  const [toShortAddress, setToShortAddress] = useState<string>(
    sale?.toAddress || ''
  )
  const [fromShortAddress, setFromShortAddress] = useState<string>(
    sale?.fromAddress || ''
  )
  const [imageSrc, setImageSrc] = useState(
    sale?.token?.tokenImage ||
      `${RESERVOIR_API_BASE}/redirect/collections/${sale?.collection?.collectionImage}/image/v1`
  )
  const [timeAgo, setTimeAgo] = useState(sale?.timestamp || '')
  const envChain = useEnvChain()
  const etherscanBaseUrl =
    envChain?.blockExplorers?.etherscan?.url || 'https://etherscan.io'
  const href = sale?.token?.tokenId
    ? `/${sale?.collection?.collectionId}/${sale?.token?.tokenId}`
    : `/collections/${sale?.collection?.collectionId}`

  useEffect(() => {
    let toShortAddress = truncateAddress(sale?.toAddress || '')
    let fromShortAddress = truncateAddress(sale?.fromAddress || '')
    if (!!address) {
      if (address?.toLowerCase() === sale?.toAddress?.toLowerCase()) {
        toShortAddress = 'You'
      }
      if (address?.toLowerCase() === sale?.fromAddress?.toLowerCase()) {
        fromShortAddress = 'You'
      }
    }
    setToShortAddress(toShortAddress)
    setFromShortAddress(fromShortAddress)
    setTimeAgo(
      sale?.timestamp
        ? DateTime.fromSeconds(sale.timestamp).toRelative() || ''
        : ''
    )
  }, [sale, address])

  useEffect(() => {
    if (sale?.token?.tokenImage) {
      setImageSrc(optimizeImage(sale?.token?.tokenImage, 48))
    } else if (sale?.collection?.collectionImage) {
      setImageSrc(optimizeImage(sale?.collection?.collectionImage, 48))
    }
  }, [sale])

  if (!sale) {
    return null
  }

  let saleDescription = ''

  const logos = {
    transfer: (
      <FiRepeat className="w- mr-1 h-4 w-4 text-neutral-400 md:mr-[10px] md:h-5 md:w-5" />
    ),
    mint: (
      <FaSeedling className="mr-1 h-4 w-4 text-neutral-400 md:mr-[10px] md:h-5 md:w-5" />
    ),
    burned: (
      <FiTrash2 className="mr-1 h-4 w-4 text-neutral-400 md:mr-[10px] md:h-5 md:w-5" />
    ),
    listing_canceled: (
      <FiXSquare className="mr-1 h-4 w-4 text-neutral-400 md:mr-[10px] md:h-5 md:w-5" />
    ),
    offer_canceled: (
      <FiXSquare className="mr-1 h-4 w-4 text-neutral-400 md:mr-[10px] md:h-5 md:w-5" />
    ),
    ask: null,
    bid: null,
  }

  switch (sale?.type) {
    case 'ask_cancel': {
      saleDescription = 'Listing Canceled'
      break
    }
    case 'bid_cancel': {
      saleDescription = 'Offer Canceled'
      break
    }
    case 'mint': {
      saleDescription = 'Mint'
      break
    }
    case 'ask': {
      saleDescription = 'Listing'
      break
    }
    case 'bid': {
      saleDescription = 'Offer'
      break
    }
    case 'transfer': {
      saleDescription = 'Transfer'
      break
    }
    case 'sale': {
      saleDescription = 'Sale'
      break
    }
    default: {
      if (sale.type) saleDescription = sale.type
      break
    }
  }

  if (isMobile) {
    return (
      <tr
        key={sale.txHash}
        className="h-24 border-b border-gray-300 dark:border-[#525252]"
      >
        <td className="flex flex-col gap-3">
          <div className="mt-6 flex items-center">
            {/* @ts-ignore */}
            {sale.type && logos[sale.type]}
            {!!sale.order?.source?.icon && (
              <img
                className="mr-2 inline h-3 w-3"
                // @ts-ignore
                src={sale.order?.source?.icon || ''}
                alt={`${sale.order?.source?.name} Source`}
              />
            )}
            <span className="text-sm capitalize text-neutral-600 dark:text-neutral-300">
              {saleDescription}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <Link href={href} passHref>
              <a className="flex items-center">
                <Image
                  className="rounded object-cover"
                  loader={({ src }) => src}
                  src={imageSrc}
                  alt={`${sale.token?.tokenName} Token Image`}
                  width={48}
                  height={48}
                />
                <div className="ml-2 grid truncate">
                  <div className="reservoir-h6 dark:text-white">
                    {sale.token?.tokenName ||
                      sale.token?.tokenId ||
                      sale.collection?.collectionName}
                  </div>
                </div>
              </a>
            </Link>
            {sale.price &&
            sale.price !== 0 &&
            sale.type &&
            !['transfer', 'mint'].includes(sale.type) ? (
              <FormatEth amount={sale.price} />
            ) : null}
          </div>

          <div className="flex items-center justify-between">
            <div className="reservoir-small">
              <span className="mr-1 font-light text-neutral-600 dark:text-neutral-300">
                From
              </span>
              {sale.fromAddress &&
              sale.fromAddress !== constants.AddressZero ? (
                <Link href={`/address/${sale.fromAddress}`}>
                  <a className="font-light text-primary-700 dark:text-primary-300">
                    {fromShortAddress}
                  </a>
                </Link>
              ) : (
                <span className="font-light">-</span>
              )}
              <span className="mx-1 font-light text-neutral-600 dark:text-neutral-300">
                to
              </span>
              {sale.toAddress && sale.toAddress !== constants.AddressZero ? (
                <Link href={`/address/${sale.toAddress}`}>
                  <a className="font-light text-primary-700 dark:text-primary-300">
                    {toShortAddress}
                  </a>
                </Link>
              ) : (
                <span className="font-light">-</span>
              )}
              <div className="mb-4 flex items-center justify-between gap-2 font-light text-neutral-600 dark:text-neutral-300 md:justify-start">
                {timeAgo}
              </div>
            </div>
            {sale.txHash && (
              <Link href={`${etherscanBaseUrl}/tx/${sale.txHash}`}>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mb-4 flex items-center justify-between gap-2 font-light text-neutral-600 dark:text-neutral-300 md:justify-start"
                >
                  <FiExternalLink className="h-4 w-4 text-primary-700 dark:text-primary-300" />
                </a>
              </Link>
            )}
          </div>
        </td>
      </tr>
    )
  }

  return (
    <tr
      key={sale.txHash}
      className="h-24 border-b border-gray-300 dark:border-[#525252]"
    >
      <td className="px-6 py-4">
        <div className="mr-2.5 flex items-center">
          {/* @ts-ignore */}
          {sale.type && logos[sale.type]}
          {!!sale.order?.source?.icon && (
            <img
              className="mr-2 h-6 w-6"
              // @ts-ignore
              src={sale.order?.source?.icon || ''}
              alt={`${sale.order?.source?.name} Source`}
            />
          )}
          <span className="text-sm capitalize text-neutral-600 dark:text-neutral-300">
            {saleDescription}
          </span>
        </div>
      </td>
      <td className="px-6 py-4">
        <Link href={href} passHref>
          <a className="mr-2.5 flex items-center">
            <Image
              className="rounded object-cover"
              loader={({ src }) => src}
              src={imageSrc}
              alt={`${sale.token?.tokenName} Token Image`}
              width={48}
              height={48}
            />
            <div className="ml-2 grid truncate">
              <div className="reservoir-h6 dark:text-white">
                {sale.token?.tokenName ||
                  sale.token?.tokenId ||
                  sale.collection?.collectionName}
              </div>
            </div>
          </a>
        </Link>
      </td>
      <td className="px-6 py-4">
        {sale.price &&
        sale.price !== 0 &&
        sale.type &&
        !['transfer', 'mint'].includes(sale.type) ? (
          <FormatEth amount={sale.price} />
        ) : null}
      </td>
      <td className="px-6 py-4">
        {sale.fromAddress && sale.fromAddress !== constants.AddressZero ? (
          <Link href={`/address/${sale.fromAddress}`}>
            <a className="ml-2.5 mr-2.5 font-light text-primary-700 dark:text-primary-300">
              {fromShortAddress}
            </a>
          </Link>
        ) : (
          <span className="ml-2.5 mr-2.5 font-light">-</span>
        )}
      </td>
      <td className="px-6 py-4">
        {sale.toAddress && sale.toAddress !== constants.AddressZero ? (
          <Link href={`/address/${sale.toAddress}`}>
            <a className="ml-2.5 mr-2.5 font-light text-primary-700 dark:text-primary-300">
              {toShortAddress}
            </a>
          </Link>
        ) : (
          <span className="ml-2.5 mr-2.5 font-light">-</span>
        )}
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2 whitespace-nowrap font-light text-neutral-600 dark:text-neutral-300">
          {timeAgo}
          {sale.txHash && (
            <Link href={`${etherscanBaseUrl}/tx/${sale.txHash}`}>
              <a target="_blank" rel="noopener noreferrer">
                <FiExternalLink className="h-4 w-4 text-primary-700 dark:text-primary-300" />
              </a>
            </Link>
          )}
        </div>
      </td>
    </tr>
  )
}

export default ActivityTable
