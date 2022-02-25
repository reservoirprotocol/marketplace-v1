import Link from 'next/link'
import { BigNumber, constants, utils } from 'ethers'
import { optimizeImage } from 'lib/optmizeImage'
import { paths } from 'interfaces/apiTypes'
import { formatBN, formatNumber } from 'lib/numbers'
import { FC } from 'react'

type Props = {
  tokens: paths['/users/{user}/tokens']['get']['responses']['200']['schema']
  portfolio: paths['/users/{user}/collections']['get']['responses']['200']['schema']
  viewRef: (node?: Element) => void
  isOwner: boolean
}

const Portfolio: FC<Props> = ({ tokens, portfolio, viewRef, isOwner }) => {
  return (
    <table className="mb-6 w-full table-auto">
      <thead>
        <tr className="text-left">
          <th className="px-3">Collection</th>
          <th className="pr-3">Item</th>
          <th className="whitespace-nowrap pr-3">List Price</th>
          <th className="whitespace-nowrap pr-3">Top Offer</th>
          <th className="pr-3">Floor</th>
        </tr>
      </thead>
      <tbody>
        {tokens?.tokens?.map(({ token, ownership }, index, arr) => (
          <tr
            key={`${token?.collection?.id}-${index}`}
            // ref={index === arr.length - 5 ? viewRef : null}
            className="group even:bg-neutral-100 dark:even:bg-neutral-900"
          >
            <td className="pr-3">
              <Link href={`/collections/${token?.collection?.id}`}>
                <a
                  title={token?.collection?.name}
                  className="block max-w-[250px] truncate whitespace-nowrap p-2"
                >
                  {token?.collection?.name}
                </a>
              </Link>
            </td>
            <td className="pr-3">
              <Link href={`/collections/${token?.contract}/${token?.tokenId}`}>
                <a className="flex items-center gap-2 p-1 md:p-2">
                  <div className="relative h-10 w-10">
                    {token?.image && (
                      <div className="aspect-w-1 aspect-h-1 relative">
                        <img
                          src={optimizeImage(token?.image, 35)}
                          alt={token?.image}
                          className="w-[35px] object-contain"
                          width="35"
                          height="35"
                        />
                      </div>
                    )}
                  </div>
                  <span className="whitespace-nowrap">{token?.name}</span>
                </a>
              </Link>
            </td>
            <td className="pr-3">
              <div className="min-w-[70px]">
                <span className={`${isOwner ? 'group-hover:hidden' : ''}`}>
                  {formatBN(ownership?.floorSellValue, 2)}
                </span>
                {isOwner && (
                  <div className="hidden group-hover:inline-block">
                    <Link
                      href={`/collections/${token?.contract}/${token?.tokenId}/sell`}
                      passHref
                    >
                      {ownership?.floorSellValue ? 'Edit' : 'List'}
                    </Link>
                  </div>
                )}
              </div>
            </td>
            <td className="pr-3">
              {token?.topBuy?.value ? (
                isOwner ? (
                  <div className="min-w-[95px]">
                    <span className="group-hover:hidden">
                      {token?.topBuy?.value}
                    </span>
                    <div className="hidden group-hover:inline-block">
                      Accept
                    </div>
                  </div>
                ) : (
                  `Ξ${formatNumber(token?.topBuy?.value)}`
                )
              ) : (
                '-'
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default Portfolio
