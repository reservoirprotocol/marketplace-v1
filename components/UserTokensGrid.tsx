import { FC, ComponentProps, useState } from 'react'
import LoadingCard from './LoadingCard'
import Link from 'next/link'
import { optimizeImage } from 'lib/optmizeImage'
import { useAccount, useSigner } from 'wagmi'
import Toast from 'components/Toast'
import { ListModal } from '@reservoir0x/reservoir-kit-ui'
import AcceptOffer from 'components/AcceptOffer'

import FormatEth from './FormatEth'
import useUserTokens from 'hooks/useUserTokens'
import FormatWEth from 'components/FormatWEth'

const API_BASE =
  process.env.NEXT_PUBLIC_RESERVOIR_API_BASE || 'https://api.reservoir.tools'

type Props = {
  data: ReturnType<typeof useUserTokens>

  mutate: () => any
  isOwner: boolean
  modal: {
    accountData: ReturnType<typeof useAccount>
    collectionId: string | undefined
    isInTheWrongNetwork: boolean | undefined
    setToast: (data: ComponentProps<typeof Toast>['data']) => any
    signer: ReturnType<typeof useSigner>['data']
  }
}

const Token = ({ token, modal, mutate, isOwner }: any) => {
  const [isBroken, setIsBroken] = useState(false)

  return (
    <div className="group overflow-hidden rounded-[16px] border bg-white shadow transition hover:-translate-y-0.5 hover:shadow-lg dark:border-[rgba(255,255,255,0.1)]  dark:bg-[#040404]">
      <Link href={`/${token?.token?.contract}/${token?.token?.tokenId}`}>
        <a>
          {token?.token?.image && !isBroken ? (
            <img
              onError={() => setIsBroken(true)}
              src={optimizeImage(token?.token?.image, 250)}
              alt={`${token?.token?.collection?.name}`}
              className="aspect-square w-full object-cover"
              width="250"
              height="250"
            />
          ) : (
            <div className="relative w-full">
              <div className="absolute inset-0 grid place-items-center backdrop-blur-lg">
                <div className="relative h-16 w-16 overflow-hidden">
                  <img
                    src={optimizeImage(
                      `${API_BASE}/redirect/collections/${token?.token?.collection?.id}/image/v1`,
                      250
                    )}
                    alt={`${token?.token?.collection?.name}`}
                    className="mx-auto mb-4 h-16 w-16 overflow-hidden rounded-full border border-[rgba(255,255,255,0.2)] after:absolute after:top-0 after:bottom-0 after:left-0  after:right-0 after:rounded-full after:bg-black "
                    width="64"
                    height="64"
                  />
                </div>
              </div>
              <img
                src={optimizeImage(
                  `https://api.reservoir.tools/redirect/collections/${token?.token?.collection?.id}/image/v1`,
                  250
                )}
                alt={`${token?.token?.collection?.name}`}
                className="aspect-square w-full object-cover"
                width="250"
                height="250"
              />
            </div>
          )}
          <div className="mb-1 flex border-t border-[rgba(0,0,0,0.05)] p-3 dark:border-[rgba(255,255,255,0.1)]">
            <div className="relative mr-2 h-8 w-8 overflow-hidden">
              <img
                className="border-border-light dark: relative h-full w-full overflow-hidden rounded-full border object-cover after:absolute after:top-0 after:bottom-0 after:left-0  after:right-0 after:rounded-full after:bg-black after:content-[''] dark:border-[rgba(30,30,30,1)]"
                src={`https://api.reservoir.tools/redirect/collections/${token?.token?.collection?.id}/image/v1`}
              />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-xs font-semibold opacity-70">
                {token?.token?.collection?.name}
              </p>
              <p className="truncate text-xs font-semibold">
                {token?.token?.name || `#${token?.token?.tokenId}`}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-6 px-4 pb-4 lg:pb-3">
            {token?.ownership?.floorAskPrice && (
              <div>
                <div className="text-xs  text-neutral-500 dark:text-neutral-400">
                  Listing
                </div>
                <div className="text-md reservoir-h6 dark:text-white">
                  <FormatEth
                    amount={token?.ownership?.floorAskPrice}
                    logoWidth={7}
                  />
                </div>
              </div>
            )}
            {token?.token?.topBid?.value && (
              <div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  Top Offer
                </div>
                <div className="text-md reservoir-h6 dark:text-white">
                  <FormatWEth
                    amount={token?.token?.topBid?.value}
                    logoWidth={7}
                  />
                </div>
              </div>
            )}
            {!(
              token?.ownership?.floorAskPrice && token?.token?.topBid?.value
            ) && (
              <div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  Floor
                </div>
                <div className="reservoir-h6 dark:text-white">
                  <FormatEth
                    amount={token?.token?.collection?.floorAskPrice || 0}
                    logoWidth={7}
                  />
                </div>
              </div>
            )}
          </div>
        </a>
      </Link>
      {isOwner && (
        <div className="flex items-center bg-[rgba(0,0,0,0.02)]  p-4  py-2 dark:bg-[rgba(255,255,255,0.05)]">
          <ListModal
            trigger={
              <p className="hover:color-primary mr-6 cursor-pointer text-sm font-semibold opacity-0 transition-all hover:!opacity-100 group-hover:opacity-80">
                {token?.ownership?.floorAskPrice ? 'Edit Listing' : 'List'}
              </p>
            }
            collectionId={token?.token?.collection.id}
            tokenId={token?.token?.tokenId}
            onListingError={(err: any) => {
              if (err?.code === 4001) {
                modal.setToast({
                  kind: 'error',
                  message: 'You have canceled the transaction.',
                  title: 'User canceled transaction',
                })
                return
              }
              modal.setToast({
                kind: 'error',
                message: 'The transaction was not completed.',
                title: 'Could not list token',
              })
            }}
            onClose={() => {
              mutate && mutate()
            }}
          />
          {token?.token?.topBid?.value && (
            <AcceptOffer
              data={{
                contract: token?.token?.contract,
                tokenId: token?.token?.tokenId,
              }}
              show={true}
              signer={modal.signer}
              isInTheWrongNetwork={modal.isInTheWrongNetwork}
              setToast={modal.setToast}
              mutate={mutate}
            >
              <p className="hover:color-primary cursor-pointer text-sm font-semibold opacity-0 transition-all hover:!opacity-100 group-hover:opacity-80">
                Accept Offer
              </p>
            </AcceptOffer>
          )}
        </div>
      )}
    </div>
  )
}

const UserTokensGrid: FC<Props> = ({
  data: { tokens, ref },
  modal,
  mutate,
  isOwner,
}) => {
  const { data, isValidating } = tokens
  const mappedTokens = data ? data.map(({ tokens }) => tokens).flat() : []
  const isEmpty = mappedTokens.length === 0
  const didReactEnd = isEmpty || data?.[data.length - 1]?.tokens?.length === 0

  if (isEmpty) {
    return (
      <div className="grid justify-center text-xl font-semibold">No tokens</div>
    )
  }

  return (
    <div className="mx-auto mb-8 grid max-w-[2400px] gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5">
      {isEmpty && isValidating
        ? Array(20).map((_, index) => (
            <LoadingCard key={`loading-card-${index}`} />
          ))
        : mappedTokens?.map((token, idx) => (
            <Token
              token={token}
              key={idx}
              modal={modal}
              mutate={mutate}
              isOwner={isOwner}
            />
          ))}
      {!didReactEnd &&
        Array(20)
          .fill(null)
          .map((_, index) => {
            if (index === 0) {
              return <LoadingCard viewRef={ref} key={`loading-card-${index}`} />
            }
            return <LoadingCard key={`loading-card-${index}`} />
          })}
    </div>
  )
}

export default UserTokensGrid
