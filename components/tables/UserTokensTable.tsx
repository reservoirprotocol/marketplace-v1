import Link from 'next/link'
import { optimizeImage } from 'lib/optmizeImage'
import { formatBN, formatNumber } from 'lib/numbers'
import { FC } from 'react'
import useUserTokens from 'hooks/useUserTokens'
import FormatEth from 'components/FormatEth'

type Props = {
  data: ReturnType<typeof useUserTokens>
}

const UserTokensTable: FC<Props> = ({ data: { ref, tokens } }) => {
  const { data } = tokens
  const tokensFlat = data ? data.flatMap(({ tokens }) => tokens) : []
  const isOwner = true

  return (
    <table className="mb-6 w-full table-auto">
      <thead>
        <tr className="text-left">
          <th className="pr-3">Item</th>
          <th className="whitespace-nowrap pr-3">List Price</th>
          <th className="whitespace-nowrap pr-3">Top Offer</th>
          <th className="pr-3">Floor</th>
        </tr>
      </thead>
      <tbody>
        {tokensFlat?.map((token, index, arr) => (
          <tr
            key={`${token?.token?.collection?.id}-${index}`}
            ref={index === arr.length - 5 ? ref : null}
            className="group even:bg-neutral-100 dark:even:bg-neutral-900"
          >
            <td className="pr-3">
              <Link
                href={`/${token?.token?.contract}/${token?.token?.tokenId}`}
              >
                <a className="flex items-center gap-2 p-1 md:p-2">
                  <div className="relative h-10 w-10">
                    {token?.token?.image && (
                      <div className="aspect-w-1 aspect-h-1 relative">
                        <img
                          src={optimizeImage(token?.token?.image, 35)}
                          alt={token?.token?.image}
                          className="w-[35px] object-contain"
                          width="35"
                          height="35"
                        />
                      </div>
                    )}
                  </div>
                  <span className="whitespace-nowrap">
                    <div> {token?.token?.collection?.name}</div>
                    <div className="font-semibold"> {token?.token?.name}</div>
                  </span>
                </a>
              </Link>
            </td>
            <td className="pr-3">
              <div className="min-w-[70px]">
                <span className={`${isOwner ? 'group-hover:hidden' : ''}`}>
                  <FormatEth
                    amount={token?.ownership?.floorSellValue}
                    maximumFractionDigits={4}
                  />
                </span>
                {isOwner && (
                  <div className="hidden group-hover:inline-block">
                    <Link
                      href={`/${token?.token?.contract}/${token?.token?.tokenId}`}
                      passHref
                    >
                      {token?.ownership?.floorSellValue ? 'Edit' : 'List'}
                    </Link>
                  </div>
                )}
              </div>
            </td>
            <td className="pr-3">
              {token?.token?.topBuy?.value ? (
                isOwner ? (
                  <div className="min-w-[95px]">
                    <span className="group-hover:hidden">
                      <FormatEth
                        amount={token?.token?.topBuy?.value}
                        maximumFractionDigits={4}
                      />
                    </span>
                    <div className="hidden group-hover:inline-block">
                      Accept
                    </div>
                  </div>
                ) : (
                  <FormatEth
                    amount={token?.token?.topBuy?.value}
                    maximumFractionDigits={4}
                  />
                )
              ) : (
                '-'
              )}
            </td>
            <td>
              <FormatEth
                amount={token?.ownership?.floorSellValue}
                maximumFractionDigits={4}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default UserTokensTable
