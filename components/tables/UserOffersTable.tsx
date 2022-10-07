import { ComponentProps, FC, useEffect } from 'react'
import { DateTime } from 'luxon'
import Link from 'next/link'
import { optimizeImage } from 'lib/optmizeImage'
import CancelOffer from 'components/CancelOffer'
import { useAccount, useSigner } from 'wagmi'
import Toast from 'components/Toast'
import FormatCrypto from 'components/FormatCrypto'
import { useBids } from '@reservoir0x/reservoir-kit-ui'
import { useInView } from 'react-intersection-observer'

type Props = {
  data: ReturnType<typeof useBids>
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

const UserOffersTable: FC<Props> = ({ data, mutate, modal, isOwner }) => {
  const { ref, inView } = useInView()
  useEffect(() => {
    if (inView && data.hasNextPage) {
      data.fetchNextPage()
    }
  }, [inView])
  const bids = data.data

  if (bids.length === 0) {
    return (
      <div className="reservoir-body mt-14 grid justify-center dark:text-white">
        You have not made any offers.
      </div>
    )
  }

  return (
    <div className="mb-11 overflow-x-auto border-b border-gray-200 shadow dark:border-neutral-600 sm:rounded-lg">
      <table className="min-w-full table-auto divide-y divide-gray-200 dark:divide-neutral-600">
        <thead className="bg-gray-50 dark:bg-neutral-900">
          <tr>
            {['Type', 'Item', 'Offer', 'Expiration'].map((item) => (
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
                <span className="sr-only">Cancel</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {bids?.map((position, index, arr) => {
            const {
              collectionName,
              contract,
              expiration,
              id,
              key,
              href,
              image,
              kind,
              tokenName,
              tokenId,
              price,
              value,
            } = processPosition(position)

            return (
              <tr
                key={`${contract}-${index}`}
                ref={index === arr.length - 5 ? ref : null}
                className="group h-[80px] bg-white even:bg-gray-50 dark:bg-neutral-900 dark:text-white dark:even:bg-neutral-800"
              >
                {/* TYPE */}
                <td className="reservoir-body whitespace-nowrap px-6 py-4 capitalize dark:text-white">
                  {kind}
                </td>

                {/* ITEM */}
                <td className="reservoir-body whitespace-nowrap px-6 py-4 dark:text-white">
                  <Link href={href || '#'}>
                    <a className="flex items-center gap-2">
                      <div className="relative h-10 w-10">
                        {image && (
                          <div className="aspect-w-1 aspect-h-1 relative">
                            <img
                              src={optimizeImage(image, 35)}
                              alt="Bid Image"
                              className="w-[35px] object-contain"
                              width="35"
                              height="35"
                            />
                          </div>
                        )}
                      </div>
                      <span className="whitespace-nowrap">
                        <div className="reservoir-body dark:text-white">
                          {collectionName}
                        </div>
                        <div>
                          <span className="reservoir-body dark:text-white">
                            {key} {value}
                          </span>
                        </div>
                        <div className="reservoir-h6 font-headings dark:text-white">
                          {tokenName}
                        </div>
                      </span>
                    </a>
                  </Link>
                </td>

                {/* OFFER */}
                <td className="reservoir-body whitespace-nowrap px-6 py-4 dark:text-white">
                  <FormatCrypto
                    amount={price?.amount?.decimal}
                    address={price?.currency?.contract}
                    decimals={price?.currency?.decimals}
                  />
                </td>

                {/* EXPIRATION */}
                <td className="reservoir-body whitespace-nowrap px-6 py-4 dark:text-white">
                  {expiration}
                </td>
                {isOwner && (
                  <td className="reservoir-body flex justify-end whitespace-nowrap px-6 py-4 dark:text-white">
                    <CancelOffer
                      data={{
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

export default UserOffersTable

function processPosition(
  position: NonNullable<NonNullable<Props['data']['data']>>[0] | undefined
) {
  const kind = position?.metadata?.kind
  // @ts-ignore
  const key = position?.metadata?.data?.attributes?.[0]?.key
  // @ts-ignore
  const value = position?.metadata?.data?.attributes?.[0]?.value
  let tokenId
  let contract = position?.tokenSetId?.split(':')[1]
  let href

  switch (kind) {
    case 'token':
      tokenId = position?.tokenSetId?.split(':')[2]
      href = `/${contract}/${tokenId}`
      break
    // @ts-ignore
    case 'attribute':
      tokenId = undefined
      href = `/collections/${contract}?attributes[${key}]=${value}`
      break
    // @ts-ignore
    case 'collection':
      tokenId = undefined
      href = `/collections/${contract}`
      break

    default:
      break
  }

  const data = {
    key,
    value,
    kind,
    contract,
    tokenId,
    image: position?.metadata?.data?.image,
    tokenName: position?.metadata?.data?.tokenName,
    expiration:
      position?.expiration === 0
        ? 'Never'
        : DateTime.fromMillis(+`${position?.expiration}000`).toRelative(),
    id: position?.id,
    collectionName: position?.metadata?.data?.collectionName,
    price: position?.price,
  }

  return { ...data, href }
}
