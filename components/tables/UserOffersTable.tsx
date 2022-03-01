import { ComponentProps, FC } from 'react'
import { DateTime } from 'luxon'
import useUserPositions from 'hooks/useUserPositions'
import FormatEth from 'components/FormatEth'
import Link from 'next/link'
import { optimizeImage } from 'lib/optmizeImage'
import CancelOffer from 'components/CancelOffer'
import { useAccount, useSigner } from 'wagmi'
import Toast from 'components/Toast'

type Props = {
  apiBase: string
  isOwner: boolean
  maker: string
  modal: {
    accountData: ReturnType<typeof useAccount>[0]['data']
    apiBase: string
    collectionId: string | undefined
    isInTheWrongNetwork: boolean | undefined
    setToast: (data: ComponentProps<typeof Toast>['data']) => any
    signer: ReturnType<typeof useSigner>[0]['data']
  }
}

const UserOffersTable: FC<Props> = ({ apiBase, maker, modal, isOwner }) => {
  const { positions, ref } = useUserPositions(apiBase, [], 'buy', maker)
  const { data } = positions
  const positionsFlat = data ? data.flatMap(({ positions }) => positions) : []

  if (positionsFlat.length === 0) {
    return (
      <div className="mt-14 grid justify-center text-lg">
        You have not made any offers.
      </div>
    )
  }

  return (
    <div className="mb-11 overflow-x-auto border-b border-gray-200 shadow sm:rounded-lg">
      <table className="min-w-full table-auto divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {['Type', 'Item', 'Offer', 'Expiration'].map((item) => (
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
                <span className="sr-only">Cancel</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {positionsFlat?.map((position, index, arr) => {
            const href =
              // @ts-ignore
              position?.set?.schema?.kind === 'collection'
                ? // @ts-ignore
                  `/collections/${position?.set?.schema?.data?.collection}`
                : // @ts-ignore
                  `/${position?.set?.schema?.data?.contract}/${position?.set?.schema?.data?.tokenId}`

            return (
              <tr
                key={`${position?.set?.id}-${index}`}
                ref={index === arr.length - 5 ? ref : null}
                className="group bg-white even:bg-gray-50"
              >
                <td className="whitespace-nowrap px-6 py-4 capitalize text-gray-500">
                  {/* @ts-ignore */}
                  {position?.set?.schema?.kind}
                </td>
                <td className="whitespace-nowrap px-6 py-4 capitalize text-gray-500">
                  <Link href={href}>
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
                        <div>{position?.set?.metadata?.collectionName}</div>
                        <div>
                          <span>
                            {/* @ts-ignore */}
                            {position?.set?.schema?.data?.attribute?.key}
                          </span>{' '}
                          <span className="font-semibold">
                            {/* @ts-ignore */}
                            {position?.set?.schema?.data?.attribute?.value}
                          </span>
                        </div>
                        <div className="font-semibold">
                          {/* @ts-ignore */}
                          {position?.set?.metadata?.tokenName}
                        </div>
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
                    <CancelOffer
                      apiBase={modal.apiBase}
                      data={{
                        collectionId: modal?.collectionId,
                        hash: position?.primaryOrder?.hash,
                        // @ts-ignore
                        contract: position?.set?.schema?.data?.contract,
                        // @ts-ignore
                        tokenId: position?.set?.schema?.data?.tokenId,
                      }}
                      maker={maker}
                      signer={modal.signer}
                      show={true}
                      isInTheWrongNetwork={modal.isInTheWrongNetwork}
                      setToast={modal.setToast}
                      mutate={positions.mutate}
                    />
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default UserOffersTable
