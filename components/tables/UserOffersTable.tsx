import { ComponentProps, FC } from 'react'
import { DateTime } from 'luxon'
import useUserPositions from 'hooks/useUserPositions'
import FormatEth from 'components/FormatEth'
import Link from 'next/link'
import { optimizeImage } from 'lib/optmizeImage'
import CancelOffer from 'components/CancelOffer'
import { useAccount, useSigner } from 'wagmi'
import Toast from 'components/Toast'
import setParams from 'lib/params'

type Props = {
  data: ReturnType<typeof useUserPositions>
  isOwner: boolean
  maker: string
  mutate: () => any
  modal: {
    accountData: ReturnType<typeof useAccount>[0]['data']
    apiBase: string
    collectionId: string | undefined
    isInTheWrongNetwork: boolean | undefined
    setToast: (data: ComponentProps<typeof Toast>['data']) => any
    signer: ReturnType<typeof useSigner>[0]['data']
  }
}

const UserOffersTable: FC<Props> = ({
  data: { positions, ref },
  maker,
  mutate,
  modal,
  isOwner,
}) => {
  const { data } = positions
  const positionsFlat = data ? data.flatMap(({ positions }) => positions) : []

  if (positionsFlat.length === 0) {
    return (
      <div className="reservoir-body mt-14 grid justify-center">
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
                className="reservoir-label-l px-6 py-3 text-left"
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
                className="group bg-white even:bg-gray-50"
              >
                {/* TYPE */}
                <td className="reservoir-body whitespace-nowrap px-6 py-4 capitalize">
                  {kind}
                </td>

                {/* ITEM */}
                <td className="reservoir-body whitespace-nowrap px-6 py-4">
                  <Link href={href || '#'}>
                    <a className="flex items-center gap-2">
                      <div className="relative h-10 w-10">
                        {image && (
                          <div className="aspect-w-1 aspect-h-1 relative">
                            <img
                              src={optimizeImage(image, 35)}
                              className="w-[35px] object-contain"
                              width="35"
                              height="35"
                            />
                          </div>
                        )}
                      </div>
                      <span className="whitespace-nowrap">
                        <div className="reservoir-body">{collectionName}</div>
                        <div>
                          <span className="reservoir-body">
                            {key} {value}
                          </span>
                        </div>
                        <div className="reservoir-h6">{tokenName}</div>
                      </span>
                    </a>
                  </Link>
                </td>

                {/* OFFER */}
                <td className="reservoir-body whitespace-nowrap px-6 py-4">
                  <FormatEth amount={price} maximumFractionDigits={4} />
                </td>

                {/* EXPIRATION */}
                <td className="reservoir-body whitespace-nowrap px-6 py-4">
                  {expiration}
                </td>
                {isOwner && (
                  <td className="reservoir-body whitespace-nowrap px-6 py-4">
                    <CancelOffer
                      apiBase={modal.apiBase}
                      data={{
                        collectionId: modal?.collectionId,
                        id,
                        contract,
                        tokenId,
                      }}
                      maker={maker}
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
  position:
    | NonNullable<
        NonNullable<Props['data']['positions']['data']>[0]['positions']
      >[0]
    | undefined
) {
  const kind = position?.set?.metadata?.kind
  // @ts-ignore
  const key = position?.set?.metadata?.data?.attributes?.[0]?.key
  // @ts-ignore
  const value = position?.set?.metadata?.data?.attributes?.[0]?.value

  let tokenId
  let contract
  let href

  switch (kind) {
    case 'token':
      tokenId = position?.set?.id?.split(':')[2]
      contract = position?.set?.id?.split(':')[1]
      href = `/${contract}/${tokenId}`
      break
    // @ts-ignore
    case 'attribute':
      tokenId = undefined
      contract = position?.set?.id?.split(':')[1]

      // const url = new URL(`/collections/${position?.set?.id?.split(':')[1]}`)

      // setParams(url, {`attributes[${key}]`: value})

      href = `/collections/${
        position?.set?.id?.split(':')[1]
      }?attributes[${key}]=${value}`
      break
    // @ts-ignore
    case 'collection':
      tokenId = undefined
      contract = position?.set?.id?.split(':')[1]
      href = `/collections/${position?.set?.id?.split(':')[1]}`
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
    image: position?.set?.metadata?.data?.image,
    tokenName: position?.set?.metadata?.data?.tokenName,
    expiration:
      position?.primaryOrder?.expiration === 0
        ? 'Never'
        : DateTime.fromMillis(
            +`${position?.primaryOrder?.expiration}000`
          ).toRelative(),
    id: position?.primaryOrder?.id,
    collectionName: position?.set?.metadata?.data?.collectionName,
    price: position?.primaryOrder?.value,
  }

  return { ...data, href }
}
