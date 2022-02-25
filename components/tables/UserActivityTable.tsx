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
    <table className="mb-6 w-full table-auto">
      <thead>
        <tr className="text-left">
          <th className="px-3">Type</th>
          <th className="pr-3">Item</th>
          <th className="pr-3">Price</th>
          <th className="pr-3">From</th>
          <th className="pr-3">To</th>
          <th className="pr-3">Time</th>
        </tr>
      </thead>
      <tbody>
        {transfersFlat.map((transfer, index, arr) => (
          <tr
            key={`${transfer?.token?.tokenId}-${index}`}
            ref={index === arr.length - 5 ? ref : null}
            className="group even:bg-neutral-100 dark:even:bg-neutral-900"
          >
            <td className="pr-3">
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
            <td className="pr-3">
              <Link
                href={`/${transfer?.token?.contract}/${transfer?.token?.tokenId}`}
              >
                <a className="flex items-center gap-2 p-1 md:p-2">
                  {/* <div className="relative h-10 w-10">
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
                  </div> */}
                  <span className="whitespace-nowrap">
                    <div>{transfer?.token?.collection?.name}</div>
                    <div className="font-semibold">{transfer?.token?.name}</div>
                  </span>
                </a>
              </Link>
            </td>

            <td>
              <FormatEth amount={transfer?.price} maximumFractionDigits={4} />
            </td>
            <td className="pr-3">
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
            <td className="whitespace-nowrap pr-3">
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
  )
}

export default UserActivityTable
