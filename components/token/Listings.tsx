import { useListings } from '@reservoir0x/reservoir-kit-ui'
import FormatCrypto from '../FormatCrypto'
import { truncateAddress } from 'lib/truncateText'
import { DateTime } from 'luxon'
import Link from 'next/link'
import { FC } from 'react'
import Card from './Card'

const API_BASE =
  process.env.NEXT_PUBLIC_RESERVOIR_API_BASE || 'https://api.reservoir.tools'

type Props = {
  token?: string
}

const Listings: FC<Props> = ({ token }) => {
  const { data: listings } = useListings({
    token,
    sortBy: 'price',
  })

  if (!listings || listings.length === 0) return null

  return (
    <div className="col-span-full md:col-span-4 lg:col-span-5 lg:col-start-2">
      <Card>
        <div className="reservoir-h5 mb-4 font-headings dark:bg-black dark:text-white ">
          Listings
        </div>
        <div className="max-h-96 overflow-auto rounded-2xl">
          <table className="min-w-full table-auto overflow-y-auto">
            <thead>
              <tr>
                {['Unit Price', 'Expiration', 'From'].map((item) => (
                  <th
                    key={item}
                    scope="col"
                    className="reservoir-subtitle px-6 py-3 text-left dark:text-white"
                  >
                    {item}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {listings.map((listing, index) => {
                const { expiration, from, id, unitPrice, source } =
                  processOrder(listing, index)
                return (
                  <tr
                    key={id}
                    className="group h-[80px] bg-white even:bg-gray-50 dark:bg-black dark:text-white  dark:even:bg-neutral-900"
                  >
                    {/* UNIT PRICE */}
                    <td className="reservoir-h6 whitespace-nowrap px-6 py-4 font-headings dark:text-white">
                      <FormatCrypto
                        amount={unitPrice?.amount?.decimal}
                        address={unitPrice?.currency?.contract}
                        decimals={unitPrice?.currency?.decimals}
                        maximumFractionDigits={8}
                      />
                    </td>

                    {/* TIME */}
                    <td className="reservoir-small whitespace-nowrap px-6 py-4 capitalize text-gray-500 dark:text-white">
                      {expiration}
                    </td>

                    {/* FROM */}
                    <td className="reservoir-body whitespace-nowrap px-6 py-4">
                      {from.address && (
                        <div className="flex items-center gap-2">
                          <a
                            className="h-4 w-4"
                            target="_blank"
                            rel="noopener noreferrer"
                            // @ts-ignore
                            href={source?.url}
                          >
                            {/* @ts-ignore */}
                            <img src={source?.logo} alt="" />
                          </a>
                          <Link href={from.href}>
                            <a className="reservoir-subtitle text-primary-700 dark:text-primary-100">
                              {truncateAddress(from.address)}
                            </a>
                          </Link>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

export default Listings

function processOrder(
  order: NonNullable<ReturnType<typeof useListings>>['data']['0'] | undefined,
  index: number
) {
  const from = {
    href: `/address/${order?.maker}`,
    address: order?.maker,
  }
  const unitPrice = order?.price
  const id = `${order?.id}-${index}`
  const expiration =
    order?.validUntil === 0
      ? 'Never'
      : DateTime.fromMillis(+`${order?.validUntil}000`).toRelative()

  const source = {
    ...order?.source,
    logo: `${API_BASE}/redirect/sources/${order?.source?.name}/logo/v2`,
  }

  const data = {
    expiration,
    from,
    id,
    unitPrice,
    source,
  }

  return data
}
