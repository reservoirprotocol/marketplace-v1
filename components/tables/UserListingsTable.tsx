import { ComponentProps, FC } from 'react'
import { DateTime } from 'luxon'
import Link from 'next/link'
import { optimizeImage } from 'lib/optmizeImage'
import FormatEth from 'components/FormatEth'
import { useAccount, useSigner } from 'wagmi'
import Toast from 'components/Toast'
import CancelListing from 'components/CancelListing'
import useUserAsks from 'hooks/useUserAsks'

type Props = {
  data: ReturnType<typeof useUserAsks>
  isOwner: boolean
  mutate: () => any
  modal: {
    accountData: ReturnType<typeof useAccount>
    collectionId: string | undefined
    isInTheWrongNetwork: boolean | undefined
    setToast: (data: ComponentProps<typeof Toast>['data']) => any
    signer: ReturnType<typeof useSigner>['data']
  }
}

const UserListingsTable: FC<Props> = ({ modal, mutate, isOwner, data }) => {
  const { data: listings, ref } = data

  if (listings.length === 0) {
    return (
      <div className="reservoir-body mt-14 grid justify-center dark:text-white">
        You don&apos;t have any items listed for sale.
      </div>
    )
  }

  return (
    <div className="mb-11 overflow-x-auto border-b border-gray-200 shadow dark:border-neutral-600 sm:rounded-lg">
      <table className="min-w-full table-auto divide-y divide-gray-200 dark:divide-neutral-600">
        <thead className="bg-gray-50 dark:bg-neutral-900">
          <tr>
            {['Item', 'Price', 'Expiration'].map((item) => (
              <th
                key={item}
                scope="col"
                className="reservoir-label-l px-6 py-3 text-left dark:text-white"
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
          {listings.map((position, index, arr) => {
            const {
              collectionName,
              contract,
              expiration,
              id,
              image,
              name,
              tokenHref,
              tokenId,
              price,
            } = processListing(position)

            return (
              <tr
                key={`${position?.id}-${index}`}
                ref={index === arr.length - 5 ? ref : null}
                className="group h-[80px] even:bg-neutral-100 dark:bg-neutral-900 dark:text-white dark:even:bg-neutral-800"
              >
                {/* ITEM */}
                <td className="reservoir-body whitespace-nowrap px-6 py-4 dark:text-white">
                  <Link href={tokenHref}>
                    <a className="flex items-center gap-2">
                      <div className="relative h-10 w-10">
                        {image && (
                          <div className="aspect-w-1 aspect-h-1 relative">
                            <img
                              alt={`${position?.id} Listing`}
                              src={optimizeImage(image, 35)}
                              className="w-[35px] object-contain"
                              width="35"
                              height="35"
                            />
                          </div>
                        )}
                      </div>
                      <span className="whitespace-nowrap">
                        <div className="reservoir-body dark:text-white ">
                          {collectionName}
                        </div>
                        <div className="reservoir-h6 font-headings dark:text-white ">
                          {name}
                        </div>
                      </span>
                    </a>
                  </Link>
                </td>

                {/* PRICE */}
                <td className="reservoir-body whitespace-nowrap px-6 py-4 dark:text-white">
                  <FormatEth amount={price} />
                </td>

                {/* EXPIRATION */}
                <td className="reservoir-body whitespace-nowrap px-6 py-4 dark:text-white">
                  {expiration}
                </td>
                {isOwner && (
                  <td className="reservoir-body flex justify-end whitespace-nowrap px-6 py-4 dark:text-white">
                    <CancelListing
                      data={{
                        collectionId: modal?.collectionId,
                        id,
                        contract,
                        tokenId,
                      }}
                      signer={modal.signer}
                      show={true}
                      isInTheWrongNetwork={modal.isInTheWrongNetwork}
                      setToast={modal.setToast}
                      mutate={mutate}
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

export default UserListingsTable

function processListing(
  listing: NonNullable<NonNullable<Props['data']['data']>>[0] | undefined
) {
  const tokenId = listing?.tokenSetId?.split(':')[2]
  const contract = listing?.tokenSetId?.split(':')[1]

  const data = {
    contract,
    tokenId,
    image: listing?.metadata?.data?.image,
    name: listing?.metadata?.data?.tokenName,
    expiration:
      listing?.expiration === 0
        ? 'Never'
        : DateTime.fromMillis(+`${listing?.expiration}000`).toRelative(),
    id: listing?.id,
    collectionName: listing?.metadata?.data?.collectionName,
    price: listing?.price,
  }

  const tokenHref = `/${data.contract}/${data.tokenId}`

  return { ...data, tokenHref }
}
