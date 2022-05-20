import { FC } from 'react'
import { DateTime } from 'luxon'
import useUserActivity from 'hooks/useUserActivity'
import Link from 'next/link'
import { optimizeImage } from 'lib/optmizeImage'
import EthAccount from 'components/EthAccount'
import { constants } from 'ethers'
import { useAccount } from 'wagmi'
import FormatEth from 'components/FormatEth'

type Props = {
  data: ReturnType<typeof useUserActivity>
  chainId: ChainId
}

const UserActivityTable: FC<Props> = ({
  data: { transfers, ref },
  chainId,
}) => {
  const { data } = transfers
  const { data: accountData } = useAccount()

  const transfersFlat = data ? data.flatMap(({ transfers }) => transfers) : []

  if (transfersFlat.length === 0) {
    return (
      <div className="reservoir-body mt-14 grid justify-center dark:text-white">
        No trading history yet.
      </div>
    )
  }

  return (
    <div className="mb-11 overflow-x-auto border-b border-gray-200 shadow dark:border-neutral-600 sm:rounded-lg">
      <table className="min-w-full table-auto divide-y divide-gray-200 dark:divide-neutral-600">
        <thead className="bg-gray-50 dark:bg-neutral-900">
          <tr>
            {['Type', 'Item', 'Price', 'From', 'To', 'Time'].map((item) => (
              <th
                key={item}
                scope="col"
                className="reservoir-label-l px-6 py-3 text-left dark:text-white"
              >
                {item}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {transfersFlat.map((transfer, index, arr) => {
            const {
              type,
              to,
              from,
              tokenHref,
              image,
              name,
              txUrl,
              timestamp,
              price,
              collectionName,
            } = processTransfer(transfer, accountData?.address, chainId)
            return (
              <tr
                key={`${transfer?.token?.tokenId}-${index}`}
                ref={index === arr.length - 5 ? ref : null}
                className="group h-[80px] bg-white even:bg-gray-50 dark:bg-neutral-900 dark:text-white dark:even:bg-neutral-800"
              >
                {/* TYPE */}
                <td className="reservoir-body whitespace-nowrap px-6 py-4 dark:text-white">
                  {type}
                </td>

                {/* ITEM */}
                <td className="reservoir-body whitespace-nowrap px-6 py-4 dark:text-white">
                  {tokenHref && (
                    <Link href={tokenHref}>
                      <a className="flex items-center gap-2">
                        <div className="relative h-10 w-10">
                          {image && (
                            <div className="aspect-w-1 aspect-h-1 relative">
                              <img
                                src={optimizeImage(image, 35)}
                                className="w-9 object-contain"
                                width="36"
                                height="36"
                              />
                            </div>
                          )}
                        </div>
                        <span className="whitespace-nowrap">
                          <div className="reservoir-body">{collectionName}</div>
                          <div className="reservoir-h6 ">{name}</div>
                        </span>
                      </a>
                    </Link>
                  )}
                </td>

                {/* PRICE */}
                <td className="reservoir-body whitespace-nowrap px-6 py-4 dark:text-white">
                  <FormatEth amount={price} />
                </td>

                {/* FROM */}
                <td className="reservoir-body whitespace-nowrap px-6 py-4 dark:text-white">
                  {from && (
                    <Link href={`/address/${from}`}>
                      <a>
                        <EthAccount address={from} />
                      </a>
                    </Link>
                  )}
                </td>

                {/* TO */}
                <td className="pr-3">
                  {to && (
                    <Link href={`/address/${to}`}>
                      <a>
                        <EthAccount address={to} />
                      </a>
                    </Link>
                  )}
                </td>

                {/* TIME */}
                <td className="whitespace-nowrap px-6 py-4 capitalize text-gray-500">
                  {txUrl && (
                    <Link href={txUrl}>
                      <a
                        className="reservoir-body"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {timestamp}
                      </a>
                    </Link>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default UserActivityTable

function processTransfer(
  transfer:
    | NonNullable<
        NonNullable<Props['data']['transfers']['data']>[0]['transfers']
      >[0]
    | undefined,
  address: string | undefined,
  chainId: ChainId | undefined
) {
  const type =
    transfer?.to?.toLowerCase() === address?.toLowerCase() &&
    transfer?.price !== null
      ? 'Buy'
      : transfer?.from?.toLowerCase() === address?.toLowerCase() &&
        transfer?.price !== null
      ? 'Sell'
      : transfer?.from === constants.AddressZero
      ? 'Mint'
      : 'Transfer'

  const etherscan = {
    4: 'https://rinkeby.etherscan.io/tx/',
    1: 'https://etherscan.io/tx/',
  }

  const data = {
    contract: transfer?.token?.contract,
    tokenId: transfer?.token?.tokenId,
    image: transfer?.token?.image,
    name: transfer?.token?.name,
    to: transfer?.to,
    from: transfer?.from,
    txUrl:
      transfer?.txHash && chainId && `${etherscan[chainId]}${transfer?.txHash}`,
    timestamp:
      transfer?.timestamp &&
      DateTime.fromMillis(+`${transfer?.timestamp}000`).toRelative(),
    price: transfer?.price,
    collectionName: transfer?.token?.collection?.name,
  }

  const tokenHref =
    // data.contract && data.tokenId && `/${data.contract}/${data.tokenId}`
    `/${data.contract}/${data.tokenId}`

  return { ...data, type, tokenHref }
}
