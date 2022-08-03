import AcceptOffer from 'components/AcceptOffer'
import BuyNow from 'components/BuyNow'
import CancelListing from 'components/CancelListing'
import CancelOffer from 'components/CancelOffer'
import { recoilTokensMap } from 'components/CartMenu'
import FormatEth from 'components/FormatEth'
import FormatWEth from 'components/FormatWEth'
import ListModal from 'components/ListModal'
import TokenOfferModal from 'components/TokenOfferModal'
import { recoilCartTokens } from 'components/TokensGrid'
import useCollection from 'hooks/useCollection'
import useDetails from 'hooks/useDetails'
import React, { FC, ReactNode } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import { useAccount, useNetwork, useSigner } from 'wagmi'
import { setToast } from './setToast'

const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID
const SOURCE_ID = process.env.NEXT_PUBLIC_SOURCE_ID
const NAVBAR_LOGO = process.env.NEXT_PUBLIC_NAVBAR_LOGO
const SOURCE_ICON = process.env.NEXT_PUBLIC_SOURCE_ICON

type Props = {
  details: ReturnType<typeof useDetails>
  collection: ReturnType<typeof useCollection>
}

const PriceData: FC<Props> = ({ details, collection }) => {
  const [cartTokens, setCartTokens] = useRecoilState(recoilCartTokens)
  const tokensMap = useRecoilValue(recoilTokensMap)
  const accountData = useAccount()
  const { data: signer } = useSigner()
  const { chain: activeChain } = useNetwork()

  const token = details.data?.tokens?.[0]

  const sourceName = token?.market?.floorAsk?.source?.name as string | undefined

  const isLocalListed =
    typeof SOURCE_ID === 'string' &&
    typeof sourceName === 'string' &&
    SOURCE_ID === sourceName

  const sourceLogo = isLocalListed
    ? SOURCE_ICON || NAVBAR_LOGO
    : `https://api.reservoir.tools/redirect/logo/v1?source=${sourceName}`

  const sourceRedirect = `https://api.reservoir.tools/redirect/token/v1?source=${sourceName}&token=${token?.token?.contract}:${token?.token?.tokenId}`

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
    token?.market?.topBid?.id !== null && isOwner ? true : false

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
              <FormatEth
                amount={token?.market?.floorAsk?.price}
                logoWidth={16}
              />
            }
          />
          <Price
            title="Top Offer"
            price={
              <FormatWEth
                amount={token?.market?.topBid?.value}
                logoWidth={16}
              />
            }
          />
        </div>
        <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
          {isOwner && (
            <ListModal
              data={{
                collection: collection.data,
                details,
              }}
              isInTheWrongNetwork={isInTheWrongNetwork}
              maker={accountData?.address}
              setToast={setToast}
              signer={signer}
            />
          )}
          {!isOwner && (
            <BuyNow
              buttonClassName="btn-primary-fill col-span-1"
              data={{
                collection: collection.data,
                details,
              }}
              signer={signer}
              isInTheWrongNetwork={isInTheWrongNetwork}
            />
          )}
          {isInCart && !isOwner && (
            <button
              onClick={() => {
                const newCartTokens = [...cartTokens]
                const index = newCartTokens.findIndex(
                  (cartToken) =>
                    cartToken.contract === contract &&
                    cartToken.tokenId === tokenId
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
                      tokenId,
                      contract,
                      collection: { name: token.token?.collection?.name },
                      image: token.token?.image,
                      floorAskPrice: token.market?.floorAsk?.price,
                      name: token.token?.name,
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
              collection: collection.data,
              details,
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
                collection: collection.data,
                details,
              }}
              royalties={{
                bps: collection.data?.collection?.royalties?.bps,
                recipient: collection.data?.collection?.royalties?.recipient,
              }}
              env={{
                chainId: +CHAIN_ID as ChainId,
              }}
              setToast={setToast}
            />
          )}

          <CancelOffer
            data={{
              collection: collection.data,
              details,
            }}
            signer={signer}
            show={isTopBidder}
            isInTheWrongNetwork={isInTheWrongNetwork}
            setToast={setToast}
          />
          <CancelListing
            data={{
              collection: collection.data,
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

const Price: FC<{ title: string; price: ReactNode; source?: ReactNode }> = ({
  title,
  price,
  source,
}) => (
  <div className="flex flex-col space-y-5">
    <div className="flex-grow">
      <div className="reservoir-h5 font-headings dark:text-white">{title}</div>
      {source}
    </div>
    <div className="reservoir-h3 font-headings dark:text-white">{price}</div>
  </div>
)
