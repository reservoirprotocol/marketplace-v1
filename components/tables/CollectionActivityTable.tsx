import FormatEth from 'components/FormatEth'
import useSales from 'hooks/useSales'
import { optimizeImage } from 'lib/optmizeImage'
import { truncateAddress } from 'lib/truncateText'
import { DateTime } from 'luxon'
import Link from 'next/link'
import { FC, useEffect, useState } from 'react'
import { Collection, TokenSale } from 'types/reservoir'
import Image from 'next/image'
import { useMediaQuery } from '@react-hookz/web'
import LoadingIcon from 'components/LoadingIcon'
import { FiExternalLink } from 'react-icons/fi'

const SOURCE_ID = process.env.NEXT_PUBLIC_SOURCE_ID
const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID
const NAVBAR_LOGO = process.env.NEXT_PUBLIC_NAVBAR_LOGO
const SOURCE_ICON = process.env.NEXT_PUBLIC_SOURCE_ICON

type Props = {
  collection: Collection
}

const CollectionActivityTable: FC<Props> = ({ collection }) => {
  const headings = ['Event', 'Item', 'Price', 'From', 'To', 'Time']
  const { sales, ref: swrInfiniteRef } = useSales(collection?.id)
  const isMobile = useMediaQuery('only screen and (max-width : 730px)')

  useEffect(() => {
    if (sales.data) {
      sales.setSize(1)
      sales.mutate()
    }
  }, [])

  const { data: salesData } = sales
  const flatSalesData = salesData?.flatMap((sale) => sale.sales) || []
  const noSales = !sales.isValidating && flatSalesData.length == 0
  const collectionImage = collection?.metadata?.imageUrl as string

  return (
    <>
      <table>
        {!isMobile && !noSales && (
          <thead>
            <tr className="text-left">
              {headings.map((name, i) => (
                <th
                  key={i}
                  className="reservoir-subtitle pt-8 pb-7 font-medium text-neutral-600 dark:text-neutral-300"
                >
                  {name}
                </th>
              ))}
            </tr>
          </thead>
        )}

        <tbody>
          {flatSalesData.map((sale, i) => {
            if (!sale) {
              return null
            }

            return (
              <CollectionActivityTableRow
                key={`${sale?.id}-${i}`}
                sale={sale}
                collectionImage={collectionImage}
              />
            )
          })}
          {noSales && (
            <div className="mt-20 mb-20 flex w-full flex-col justify-center">
              <img
                src="/magnifying-glass.svg"
                className="h-[59px]"
                alt="Magnifying Glass"
              />
              <div className="reservoir-h6 mt-4 mb-2 text-center dark:text-white">
                No activity yet
              </div>
              <div className="text-center text-xs font-light dark:text-white">
                There hasn&apos;t been any activity for this <br /> collection
                yet.
              </div>
            </div>
          )}
          <tr ref={swrInfiniteRef}></tr>
        </tbody>
      </table>
      {sales.isValidating && (
        <div className="my-20 flex justify-center">
          <LoadingIcon />
        </div>
      )}
    </>
  )
}

type CollectionActivityTableRowProps = {
  sale: TokenSale
  collectionImage?: string
}

const CollectionActivityTableRow: FC<CollectionActivityTableRowProps> = ({
  sale,
  collectionImage,
}) => {
  const isMobile = useMediaQuery('only screen and (max-width : 730px)')
  const [toShortAddress, setToShortAddress] = useState(sale.to || '')
  const [fromShortAddress, setFromShortAddress] = useState(sale.from || '')
  const [imageSrc, setImageSrc] = useState(
    sale.token?.image || collectionImage || ''
  )
  const [timeAgo, setTimeAgo] = useState(sale.timestamp || '')

  useEffect(() => {
    setToShortAddress(truncateAddress(sale?.to || ''))
    setFromShortAddress(truncateAddress(sale?.from || ''))
    setTimeAgo(
      sale?.timestamp
        ? DateTime.fromSeconds(sale.timestamp).toRelative() || ''
        : ''
    )
  }, [sale])

  useEffect(() => {
    if (sale?.token?.image) {
      setImageSrc(optimizeImage(sale.token.image, 48))
    } else if (collectionImage) {
      setImageSrc(optimizeImage(collectionImage, 48))
    }
  }, [sale, collectionImage])

  if (!sale) {
    return null
  }

  const saleSourceImgSrc =
    SOURCE_ID && sale.orderSource && SOURCE_ID === sale.orderSource
      ? SOURCE_ICON || NAVBAR_LOGO
      : `https://api.reservoir.tools/redirect/logo/v1?source=${sale.orderSource}`

  let saleDescription = 'Sale'

  switch (sale?.orderSide) {
    case 'ask': {
      saleDescription = 'Sale'
      break
    }
    case 'bid': {
      saleDescription = 'Offer Accepted'
    }
  }

  if (isMobile) {
    return (
      <tr
        key={sale.id}
        className="h-24 border-b border-gray-300 dark:border-[#525252]"
      >
        <td className="flex flex-col gap-2">
          <div className="mt-6">
            <img
              className="mr-2 inline h-6 w-6"
              src={saleSourceImgSrc}
              alt={`${sale.orderSource} Source`}
            />
            <span className="text-sm text-neutral-600 dark:text-neutral-300">
              {saleDescription}
            </span>
          </div>
          <Link
            href={`/${sale.token?.contract}/${sale.token?.tokenId}`}
            passHref
          >
            <a className="flex items-center">
              <Image
                className="rounded object-cover"
                loader={({ src }) => src}
                src={imageSrc}
                alt={`${sale.token?.name} Token Image`}
                width={48}
                height={48}
              />
              <span className="reservoir-h6 ml-2 truncate dark:text-white">
                {sale.token?.name}
              </span>
            </a>
          </Link>
          <div>
            <span className="mr-1 font-light text-neutral-600 dark:text-neutral-300">
              From
            </span>
            <Link href={`/address/${sale.from}`}>
              <a className="font-light text-primary-700 dark:text-primary-300">
                {fromShortAddress}
              </a>
            </Link>
            <span className="mx-1 font-light text-neutral-600 dark:text-neutral-300">
              to
            </span>
            <Link href={`/address/${sale.to}`}>
              <a className="font-light text-primary-700 dark:text-primary-300">
                {toShortAddress}
              </a>
            </Link>
            <Link
              href={`https://${
                CHAIN_ID === '4' ? 'rinkeby.' : ''
              }etherscan.io/tx/${sale.txHash}`}
            >
              <a
                target="_blank"
                rel="noopener noreferrer"
                className="mb-4 flex items-center gap-2 font-light text-neutral-600 dark:text-neutral-300"
              >
                {timeAgo}
                <FiExternalLink className="h-4 w-4" />
              </a>
            </Link>
          </div>
        </td>
        <td>
          <FormatEth amount={sale.price} />
        </td>
      </tr>
    )
  }

  return (
    <tr
      key={sale.id}
      className="h-24 border-b border-gray-300 dark:border-[#525252]"
    >
      <td>
        <div className="mr-2.5 flex items-center">
          <img
            className="mr-2 h-6 w-6"
            src={saleSourceImgSrc}
            alt={`${sale.orderSource} Source`}
          />
          <span className="text-sm text-neutral-600 dark:text-neutral-300">
            {saleDescription}
          </span>
        </div>
      </td>
      <td>
        <Link href={`/${sale.token?.contract}/${sale.token?.tokenId}`} passHref>
          <a className="mr-2.5 flex items-center">
            <Image
              className="rounded object-cover"
              loader={({ src }) => src}
              src={imageSrc}
              alt={`${sale.token?.name} Token Image`}
              width={48}
              height={48}
            />
            <span className="reservoir-h6 ml-2 truncate dark:text-white">
              {sale.token?.name}
            </span>
          </a>
        </Link>
      </td>
      <td>
        <FormatEth amount={sale.price} />
      </td>
      <td>
        <Link href={`/address/${sale.from}`}>
          <a className="ml-2.5 mr-2.5 font-light text-primary-700 dark:text-primary-300">
            {fromShortAddress}
          </a>
        </Link>
      </td>
      <td>
        <Link href={`/address/${sale.to}`}>
          <a className="mr-2.5 font-light text-primary-700 dark:text-primary-300">
            {toShortAddress}
          </a>
        </Link>
      </td>
      <td>
        <Link
          href={`https://${CHAIN_ID === '4' ? 'rinkeby.' : ''}etherscan.io/tx/${
            sale.txHash
          }`}
        >
          <a
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 whitespace-nowrap font-light text-neutral-600 dark:text-neutral-300"
          >
            {timeAgo}
            <FiExternalLink className="h-4 w-4" />
          </a>
        </Link>
      </td>
    </tr>
  )
}

export default CollectionActivityTable
