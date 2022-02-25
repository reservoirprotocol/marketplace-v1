import { FC } from 'react'
import { DateTime } from 'luxon'
import useUserPositions from 'hooks/useUserPositions'
import Link from 'next/link'
import { optimizeImage } from 'lib/optmizeImage'
import FormatEth from 'components/FormatEth'

type Props = {
  data: ReturnType<typeof useUserPositions>
}

const UserListingsTable: FC<Props> = ({ data: { positions, ref } }) => {
  const { data } = positions
  const positionsFlat = data ? data.flatMap(({ positions }) => positions) : []
  const isOwner = true

  return (
    <table className="mb-6 w-full table-auto">
      <thead>
        <tr className="text-left">
          <th className="pr-3">Item</th>
          <th className="whitespace-nowrap">Price</th>
          <th className="whitespace-nowrap">Expiration</th>
          {isOwner && <th></th>}
        </tr>
      </thead>
      <tbody>
        {positionsFlat?.map((position, index, arr) => (
          <tr
            key={`${position?.set?.id}-${index}`}
            ref={index === arr.length - 5 ? ref : null}
            className="group even:bg-neutral-100 dark:even:bg-neutral-900"
          >
            <td>
              <Link
                //   @ts-ignore
                href={`/${position?.set?.schema?.data?.contract}/${position?.set?.schema?.data?.tokenId}`}
              >
                <a className="flex items-center gap-2 p-1 md:p-2">
                  <div className="relative h-10 w-10">
                    {position?.set?.image && (
                      <div className="aspect-w-1 aspect-h-1 relative">
                        <img
                          src={optimizeImage(position?.set?.image, 35)}
                          alt={position?.set?.image}
                          className="w-[35px] object-contain"
                          width="35"
                          height="35"
                        />
                      </div>
                    )}
                  </div>
                  <span className="whitespace-nowrap">
                    {/* @ts-ignore */}
                    {position?.set?.schema?.data?.tokenId}
                  </span>
                </a>
              </Link>
            </td>
            <td>
              <FormatEth
                amount={position?.primaryOrder?.value}
                maximumFractionDigits={4}
              />
            </td>
            <td className="whitespace-nowrap pr-3">
              {position?.primaryOrder?.expiry === 0
                ? 'Never'
                : DateTime.fromMillis(
                    +`${position?.primaryOrder?.expiry}000`
                  ).toRelative()}
            </td>
            {isOwner && (
              <td>
                <button className="btn-red-fill">Cancel</button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default UserListingsTable
