import { paths, setParams } from '@reservoir0x/client-sdk'
import EthAccount from 'components/EthAccount'
import FormatEth from 'components/FormatEth'
import useAsks from 'hooks/useAsks'
import { DateTime } from 'luxon'
import Link from 'next/link'
import { FC } from 'react'
import Card from './Card'

const RESERVOIR_API_BASE = process.env.NEXT_PUBLIC_RESERVOIR_API_BASE

type Props = {
  asks: ReturnType<typeof useAsks>
}

const Listings: FC<Props> = ({ asks }) => {
  const orders = asks.data?.orders

  if (!orders) return null

  return (
    <Card>
      <div className="reservoir-h5 mb-4">Listings</div>
      <div className="max-h-96 overflow-hidden overflow-y-auto rounded-2xl">
        <table className="min-w-full table-auto divide-y divide-gray-200 overflow-y-auto">
          <thead className="bg-gray-50">
            <tr>
              {['Unit Price', 'Expiration', 'From'].map((item) => (
                <th
                  key={item}
                  scope="col"
                  className="reservoir-label-l px-6 py-3 text-left"
                >
                  {item}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map((order, index) => {
              const { expiration, from, id, unitPrice, source } = processOrder(
                order,
                index
              )
              return (
                <tr
                  key={id}
                  className="group h-[80px] bg-white even:bg-gray-50"
                >
                  {/* UNIT PRICE */}
                  <td className="reservoir-body whitespace-nowrap px-6 py-4">
                    <FormatEth amount={unitPrice} maximumFractionDigits={4} />
                  </td>

                  {/* TIME */}
                  <td className="whitespace-nowrap px-6 py-4 capitalize text-gray-500">
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
                          <a>
                            <EthAccount
                              address={from.address}
                              hideIcon={true}
                            />
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
  )
}

export default Listings

function processOrder(
  order:
    | NonNullable<NonNullable<Props['asks']['data']>['orders']>[0]
    | undefined,
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

  const url = new URL('/redirect/logo/v1', RESERVOIR_API_BASE)

  const query: paths['/redirect/logo/v1']['get']['parameters']['query'] = {
    // @ts-ignore
    source: order?.source?.id,
  }

  setParams(url, query)

  const source = {
    ...order?.source,
    logo: url.href,
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
