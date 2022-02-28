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
    <div className="mb-11 overflow-hidden border-b border-gray-200 shadow sm:rounded-lg">
      <table className="min-w-full table-auto divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {['Item', 'Price', 'Expiration'].map((item) => (
              <th
                key={item}
                scope="col"
                className="px-6 py-3 text-left font-medium uppercase tracking-wider text-gray-500"
              >
                {item}
              </th>
            ))}
            {isOwner && (
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Edit</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {positionsFlat?.map((position, index, arr) => (
            <tr
              key={`${position?.set?.id}-${index}`}
              ref={index === arr.length - 5 ? ref : null}
              className="group even:bg-neutral-100 dark:even:bg-neutral-900"
            >
              <td className="whitespace-nowrap px-6 py-4 capitalize text-gray-500">
                <Link
                  //   @ts-ignore
                  href={`/${position?.set?.schema?.data?.contract}/${position?.set?.schema?.data?.tokenId}`}
                >
                  <a className="flex items-center gap-2">
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
              <td className="whitespace-nowrap px-6 py-4 capitalize text-gray-500">
                <FormatEth
                  amount={position?.primaryOrder?.value}
                  maximumFractionDigits={4}
                />
              </td>
              <td className="whitespace-nowrap px-6 py-4 capitalize text-gray-500">
                {position?.primaryOrder?.expiry === 0
                  ? 'Never'
                  : DateTime.fromMillis(
                      +`${position?.primaryOrder?.expiry}000`
                    ).toRelative()}
              </td>
              {isOwner && (
                <td className="whitespace-nowrap px-6 py-4 capitalize text-gray-500">
                  <button className="btn-red-ghost">Cancel</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default UserListingsTable
