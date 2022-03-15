import Link from 'next/link'
import { optimizeImage } from 'lib/optmizeImage'
import { ComponentProps, FC } from 'react'
import useUserTokens from 'hooks/useUserTokens'
import FormatEth from 'components/FormatEth'
import ListModal from 'components/ListModal'
import { useAccount, useSigner } from 'wagmi'
import Toast from 'components/Toast'
import AcceptOffer from 'components/AcceptOffer'

type Props = {
  data: ReturnType<typeof useUserTokens>
  isOwner: boolean
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

const UserTokensTable: FC<Props> = ({
  data: { ref, tokens },
  modal,
  mutate,
  isOwner,
}) => {
  const { data } = tokens
  const tokensFlat = data ? data.flatMap(({ tokens }) => tokens) : []

  if (tokensFlat.length === 0) {
    return (
      <div className="reservoir-body mt-14 grid justify-center">
        No items to display.
      </div>
    )
  }

  return (
    <div className="mb-11 overflow-x-auto border-b border-gray-200 shadow sm:rounded-lg">
      <table className="min-w-full table-auto divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {['Item', 'List Price', 'Top Offer', 'Floor'].map((item) => (
              <th
                key={item}
                scope="col"
                className="reservoir-label-l px-6 py-3 text-left"
              >
                {item}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tokensFlat?.map((token, index, arr) => {
            const {
              collectionId,
              collectionName,
              contract,
              image,
              listPrice,
              tokenHref,
              tokenId,
              tokenName,
              topOffer,
            } = processToken(token)

            return (
              <tr
                key={`${contract}:${tokenId}`}
                ref={index === arr.length - 5 ? ref : null}
                className="group bg-white even:bg-gray-50"
              >
                {/* ITEM */}
                <td className="reservoir-body whitespace-nowrap px-6 py-4">
                  <Link href={tokenHref}>
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
                        <div className="reservoir-h6">{tokenName}</div>
                      </span>
                    </a>
                  </Link>
                </td>

                {/* LIST PRICE */}
                <td className="reservoir-body whitespace-nowrap px-6 py-4">
                  <div className="min-w-[140px]">
                    <span className={`${isOwner ? 'group-hover:hidden' : ''}`}>
                      <FormatEth amount={listPrice} maximumFractionDigits={4} />
                    </span>
                    {isOwner && (
                      <div className="hidden group-hover:inline-block">
                        <ListModal
                          signer={modal.signer}
                          apiBase={modal.apiBase}
                          isInTheWrongNetwork={modal.isInTheWrongNetwork}
                          maker={modal.accountData?.address}
                          data={{
                            collectionId,
                            contract,
                            tokenId,
                          }}
                          mutate={mutate}
                          setToast={modal.setToast}
                        />
                      </div>
                    )}
                  </div>
                </td>

                {/* TOP OFFER */}
                <td className="reservoir-body whitespace-nowrap px-6 py-4">
                  {topOffer ? (
                    isOwner ? (
                      <div className="min-w-[140px]">
                        <span className="group-hover:hidden">
                          <FormatEth
                            amount={topOffer}
                            maximumFractionDigits={4}
                          />
                        </span>
                        <div className="hidden group-hover:inline-block">
                          <AcceptOffer
                            apiBase={modal.apiBase}
                            data={{
                              contract,
                              tokenId,
                            }}
                            signer={modal.signer}
                            show={isOwner}
                            isInTheWrongNetwork={modal.isInTheWrongNetwork}
                            setToast={modal.setToast}
                            mutate={mutate}
                          />
                        </div>
                      </div>
                    ) : (
                      <FormatEth amount={topOffer} maximumFractionDigits={4} />
                    )
                  ) : (
                    '-'
                  )}
                </td>

                {/* FLOOR */}
                <td className="reservoir-body whitespace-nowrap px-6 py-4">
                  <FormatEth amount={listPrice} maximumFractionDigits={4} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default UserTokensTable

function processToken(
  token:
    | NonNullable<NonNullable<Props['data']['tokens']['data']>[0]['tokens']>[0]
    | undefined
) {
  const data = {
    contract: token?.token?.contract,
    tokenId: token?.token?.tokenId,
    image: token?.token?.image,
    collectionName: token?.token?.collection?.name,
    collectionId: token?.token?.collection?.id,
    tokenName: token?.token?.name,
    listPrice: token?.ownership?.floorSellValue,
    topOffer: token?.token?.topBuy?.value,
  }

  const tokenHref =
    // data.contract && data.tokenId && `/${data.contract}/${data.tokenId}`
    `/${data.contract}/${data.tokenId}`

  return { ...data, tokenHref }
}
