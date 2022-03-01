import { FC } from 'react'
import { DateTime } from 'luxon'
import useUserActivity from 'hooks/useUserActivity'
import Link from 'next/link'
import { optimizeImage } from 'lib/optmizeImage'
import EthAccount from 'components/EthAccount'
import { ethers } from 'ethers'
import { useAccount } from 'wagmi'
import FormatEth from 'components/FormatEth'

type Props = {
  data: ReturnType<typeof useUserActivity>
}

const UserActivityTable: FC<Props> = ({ data: { transfers, ref } }) => {
  const { data } = transfers
  const [{ data: accountData }] = useAccount()

  const transfersFlat = data ? data.flatMap(({ transfers }) => transfers) : []

  return (
    <div className="mb-11 overflow-x-auto border-b border-gray-200 shadow sm:rounded-lg">
      <table className="min-w-full table-auto divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {['Type', 'Item', 'Price', 'From', 'To', 'Time'].map((item) => (
              <th
                key={item}
                scope="col"
                className="px-6 py-3 text-left font-medium uppercase tracking-wider text-gray-500"
              >
                {item}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {transfersFlat.map((transfer, index, arr) => (
            <tr
              key={`${transfer?.token?.tokenId}-${index}`}
              ref={index === arr.length - 5 ? ref : null}
              className="group bg-white even:bg-gray-50"
            >
              <td className="whitespace-nowrap px-6 py-4 capitalize text-gray-500">
                {transfer?.to?.toLowerCase() ===
                  accountData?.address.toLowerCase() && transfer?.price !== null
                  ? 'Buy'
                  : transfer?.from?.toLowerCase() ===
                      accountData?.address.toLowerCase() &&
                    transfer?.price !== null
                  ? 'Sell'
                  : transfer?.from === ethers.constants.AddressZero
                  ? 'Mint'
                  : 'Transfer'}
              </td>
              <td className="whitespace-nowrap px-6 py-4 capitalize text-gray-500">
                <Link
                  href={`/${transfer?.token?.collection?.id}/${transfer?.token?.tokenId}`}
                >
                  <a className="flex items-center gap-2">
                    <div className="relative h-10 w-10">
                      {transfer?.token?.image && (
                        <div className="aspect-w-1 aspect-h-1 relative">
                          <img
                            src={optimizeImage(transfer?.token?.image, 35)}
                            alt={transfer?.token?.name}
                            className="w-[35px] object-contain"
                            width="35"
                            height="35"
                          />
                        </div>
                      )}
                    </div>
                    <span className="whitespace-nowrap">
                      <div>{transfer?.token?.collection?.name}</div>
                      <div className="font-semibold">
                        {transfer?.token?.name}
                      </div>
                    </span>
                  </a>
                </Link>
              </td>
              <td className="whitespace-nowrap px-6 py-4 capitalize text-gray-500">
                <FormatEth amount={transfer?.price} maximumFractionDigits={4} />
              </td>
              <td className="whitespace-nowrap px-6 py-4 capitalize text-gray-500">
                {transfer?.from && (
                  <Link href={`/address/${transfer?.from}`}>
                    <a>
                      <EthAccount address={transfer?.from} />
                    </a>
                  </Link>
                )}
              </td>
              <td className="pr-3">
                {transfer?.to && (
                  <Link href={`/address/${transfer?.to}`}>
                    <a>
                      <EthAccount address={transfer?.to} />
                    </a>
                  </Link>
                )}
              </td>
              <td className="whitespace-nowrap px-6 py-4 capitalize text-gray-500">
                <Link
                  href={`https://${
                    process.env.NEXT_PUBLIC_CHAIN_ID === '4' ? 'rinkeby.' : ''
                  }etherscan.io/tx/${transfer?.txHash}`}
                >
                  <a target="_blank" rel="noreferrer">
                    {DateTime.fromMillis(
                      +`${transfer?.timestamp}000`
                    ).toRelative()}
                  </a>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default UserActivityTable
