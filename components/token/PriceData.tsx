import AcceptOffer from 'components/AcceptOffer'
import BuyNow from 'components/BuyNow'
import CancelListing from 'components/CancelListing'
import CancelOffer from 'components/CancelOffer'
import FormatWEth from 'components/FormatWEth'
import {
  ListModal,
  useReservoirClient,
  useTokens,
} from '@reservoir0x/reservoir-kit-ui'
import TokenOfferModal from 'components/TokenOfferModal'
import React, { FC, ReactNode } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import { useAccount, useNetwork, useSigner } from 'wagmi'
import { setToast } from './setToast'
import recoilCartTokens, { getTokensMap } from 'recoil/cart'
import FormatCrypto from 'components/FormatCrypto'
import { Collection } from 'types/reservoir'
import { formatNumber } from 'lib/numbers'

const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID
const SOURCE_ID = process.env.NEXT_PUBLIC_SOURCE_ID
const SOURCE_ICON = process.env.NEXT_PUBLIC_SOURCE_ICON
const API_BASE =
  process.env.NEXT_PUBLIC_RESERVOIR_API_BASE || 'https://api.reservoir.tools'

type Props = {
  details: ReturnType<typeof useTokens>
  collection?: Collection
}

const PriceData: FC<Props> = ({ details, collection }) => {
  const [cartTokens, setCartTokens] = useRecoilState(recoilCartTokens)
  const tokensMap = useRecoilValue(getTokensMap)
  const accountData = useAccount()
  const { data: signer } = useSigner()
  const { chain: activeChain } = useNetwork()
  const reservoirClient = useReservoirClient()

  const token = details.data ? details.data[0] : undefined

  const sourceName = token?.market?.floorAsk?.source?.name as string | undefined
  const sourceDomain = token?.market?.floorAsk?.source?.domain as
    | string
    | undefined

  let isLocalListed = false

  if (
    reservoirClient?.source &&
    sourceDomain &&
    reservoirClient.source === sourceDomain
  ) {
    isLocalListed = true
  } else if (SOURCE_ID && sourceName && SOURCE_ID === sourceName) {
    isLocalListed = true
  }

  const sourceLogo =
    isLocalListed && SOURCE_ICON
      ? SOURCE_ICON
      : `${API_BASE}/redirect/sources/${sourceDomain || sourceName}/logo/v2`

  const sourceRedirect = `${API_BASE}/redirect/sources/${
    sourceDomain || sourceName
  }/tokens/${token?.token?.contract}:${token?.token?.tokenId}/link/v2`

  if (!CHAIN_ID) return null

  const isOwner =
    token?.token?.owner?.toLowerCase() === accountData?.address?.toLowerCase()
  const isTopBidder =
    accountData.isConnected &&
    token?.market?.topBid?.maker?.toLowerCase() ===
      accountData?.address?.toLowerCase()
  const isListed = token?.market?.floorAsk?.price !== null
  const isInTheWrongNetwork = Boolean(signer && activeChain?.id !== +CHAIN_ID)

  const tokenId = token?.token?.tokenId
  const contract = token?.token?.contract

  const isInCart = Boolean(tokensMap[`${contract}:${tokenId}`])

  const showAcceptOffer =
    token?.market?.topBid?.id !== null &&
    token?.market?.topBid?.id !== undefined &&
    isOwner
      ? true
      : false

  return (
    <div className="col-span-full md:col-span-4 lg:col-span-5 lg:col-start-2">
      <article className="col-span-full rounded-2xl border border-gray-300 bg-white p-6 dark:border-neutral-600 dark:bg-black">
        <div className="grid grid-cols-2 gap-6">
          <Price
            title="List Price"
            source={
              sourceName && (
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={sourceRedirect}
                  className="reservoir-body flex items-center gap-2 dark:text-white"
                >
                  on {sourceName}
                  <img className="h-6 w-6" src={sourceLogo} alt="Source Logo" />
                </a>
              )
            }
            price={
              <FormatCrypto
                amount={token?.market?.floorAsk?.price?.amount?.native}
                address={token?.market?.floorAsk?.price?.currency?.contract}
                logoWidth={30}
              />
            }
            usdPrice={token?.market?.floorAsk?.price?.amount?.usd}
          />
          <Price
            title="Top Offer"
            price={
              <FormatCrypto
                amount={token?.market?.topBid?.price?.amount?.native}
                address={token?.market?.topBid?.price?.currency?.contract}
                logoWidth={30}
              />
            }
            usdPrice={token?.market?.topBid?.price?.amount?.usd}
          />
        </div>
        <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
          {isOwner && (
            <ListModal
              trigger={
                token?.market?.floorAsk?.price?.amount?.native ? (
                  <p className="btn-primary-fill w-full dark:ring-primary-900 dark:focus:ring-4">
                    Edit Listing
                  </p>
                ) : (
                  <div className="btn-primary-fill w-full dark:ring-primary-900 dark:focus:ring-4">
                    {token?.market?.floorAsk?.price?.amount?.native
                      ? 'Edit Listing'
                      : 'List for Sale'}
                  </div>
                )
              }
              collectionId={contract}
              tokenId={tokenId}
              onListingComplete={() => {
                details && details.mutate()
              }}
              onListingError={(err: any) => {
                if (err?.code === 4001) {
                  setToast({
                    kind: 'error',
                    message: 'You have canceled the transaction.',
                    title: 'User canceled transaction',
                  })
                  return
                }
                setToast({
                  kind: 'error',
                  message: 'The transaction was not completed.',
                  title: 'Could not list token',
                })
              }}
            />
          )}
          {!isOwner && (
            <BuyNow
              buttonClassName="btn-primary-fill col-span-1"
              data={{
                details: details,
              }}
              signer={signer}
              isInTheWrongNetwork={isInTheWrongNetwork}
              mutate={details.mutate}
            />
          )}
          {isInCart && !isOwner && (
            <button
              onClick={() => {
                const newCartTokens = [...cartTokens]
                const index = newCartTokens.findIndex(
                  (cartToken) =>
                    cartToken?.token?.contract === contract &&
                    cartToken?.token?.tokenId === tokenId
                )
                newCartTokens.splice(index, 1)
                setCartTokens(newCartTokens)
              }}
              className="outline-none"
            >
              <div className="btn-primary-outline w-full text-[#FF3B3B] disabled:cursor-not-allowed dark:border-neutral-600  dark:text-red-300 dark:ring-primary-900 dark:focus:ring-4">
                Remove
              </div>
            </button>
          )}
          {!isInCart && !isOwner && isListed && (
            <button
              disabled={!token?.market?.floorAsk?.price}
              onClick={() => {
                if (tokenId && contract) {
                  setCartTokens([
                    ...cartTokens,
                    {
                      token: {
                        tokenId,
                        contract,
                        collection: { name: token.token?.collection?.name },
                        image: token.token?.image,
                        name: token.token?.name,
                      },
                      market: {
                        floorAsk: {
                          ...token.market?.floorAsk,
                        },
                      },
                    },
                  ])
                }
              }}
              className="outline-none"
            >
              <div className="btn-primary-outline w-full px-[10px] dark:border-neutral-600 dark:text-white dark:ring-primary-900  dark:focus:ring-4">
                Add to Cart
              </div>
            </button>
          )}
          <AcceptOffer
            data={{
              details: details.data,
            }}
            isInTheWrongNetwork={isInTheWrongNetwork}
            setToast={setToast}
            show={showAcceptOffer}
            signer={signer}
          />
          {!isOwner && (
            <TokenOfferModal
              signer={signer}
              data={{
                details,
              }}
              royalties={{
                bps: collection?.royalties?.bps,
                recipient: collection?.royalties?.recipient,
              }}
              env={{
                chainId: +CHAIN_ID as ChainId,
              }}
              setToast={setToast}
            />
          )}

          <CancelOffer
            data={{
              details,
            }}
            signer={signer}
            show={isTopBidder}
            isInTheWrongNetwork={isInTheWrongNetwork}
            setToast={setToast}
          />
          <CancelListing
            data={{
              details,
            }}
            signer={signer}
            show={isOwner && isListed}
            isInTheWrongNetwork={isInTheWrongNetwork}
            setToast={setToast}
          />
        </div>
      </article>
    </div>
  )
}

export default PriceData

const Price: FC<{
  title: string
  price: ReactNode
  source?: ReactNode
  usdPrice?: number
}> = ({ title, price, usdPrice, source }) => (
  <div className="flex flex-col space-y-5">
    <div className="flex-grow">
      <div className="reservoir-h5 font-headings dark:text-white">{title}</div>
      {source}
    </div>
    <div className="reservoir-h3 font-headings dark:text-white">{price}</div>
    <div className="text-xs text-neutral-600">{formatNumber(usdPrice)}</div>
  </div>
)
