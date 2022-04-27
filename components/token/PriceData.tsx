import AcceptOffer from 'components/AcceptOffer'
import BuyNow from 'components/BuyNow'
import CancelListing from 'components/CancelListing'
import CancelOffer from 'components/CancelOffer'
import FormatEth from 'components/FormatEth'
import ListModal from 'components/ListModal'
import TokenOfferModal from 'components/TokenOfferModal'
import useCollection from 'hooks/useCollection'
import useDetails from 'hooks/useDetails'
import React, { FC, ReactNode } from 'react'
import { useAccount, useNetwork, useSigner } from 'wagmi'
import { setToast } from './setToast'

const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID
const OPENSEA_API_KEY = process.env.NEXT_PUBLIC_OPENSEA_API_KEY

type Props = {
  details: ReturnType<typeof useDetails>
  collection: ReturnType<typeof useCollection>
}

const PriceData: FC<Props> = ({ details, collection }) => {
  const [{ data: accountData }] = useAccount()
  const [{ data: signer }] = useSigner()
  const [{ data: network }] = useNetwork()

  const token = details.data?.tokens?.[0]

  const sourceLogo = `https://api.reservoir.tools/redirect/logo/v1?source=${token?.market?.floorAsk?.source?.name}`

  const sourceRedirect = `https://api.reservoir.tools/redirect/token/v1?source=${token?.market?.floorAsk?.source?.name}&token=${token?.token?.contract}:${token?.token?.tokenId}`

  if (!CHAIN_ID) return null

  const isOwner =
    token?.token?.owner?.toLowerCase() === accountData?.address.toLowerCase()
  const isTopBidder =
    !!accountData &&
    token?.market?.topBid?.maker?.toLowerCase() ===
      accountData?.address?.toLowerCase()
  const isListed = token?.market?.floorAsk?.price !== null
  const isInTheWrongNetwork = signer && network.chain?.id !== +CHAIN_ID

  return (
    <div className="col-span-full md:col-span-4 lg:col-span-5 lg:col-start-2">
      <article className="col-span-full rounded-2xl border border-gray-300 bg-white p-6 dark:border-neutral-600 dark:bg-black">
        <div className="grid grid-cols-2 gap-6">
          <Price
            title="List Price"
            source={
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={sourceRedirect}
                className="reservoir-body flex items-center gap-2 dark:text-white"
              >
                on {token?.market?.floorAsk?.source?.name}
                {<img className="h-6 w-6" src={sourceLogo} alt="Source Logo" />}
              </a>
            }
            price={
              <FormatEth
                amount={token?.market?.floorAsk?.price}
                maximumFractionDigits={4}
                logoWidth={16}
              />
            }
          />
          <Price
            title="Top Offer"
            price={
              <FormatEth
                amount={token?.market?.topBid?.value}
                maximumFractionDigits={4}
                logoWidth={16}
              />
            }
          />
          <div className="col-span-2 grid gap-4 md:grid-cols-2 md:gap-6">
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
            <BuyNow
              data={{
                collection: collection.data,
                details,
              }}
              signer={signer}
              isInTheWrongNetwork={isInTheWrongNetwork}
              setToast={setToast}
              show={!isOwner}
            />
            <AcceptOffer
              data={{
                collection: collection.data,
                details,
              }}
              isInTheWrongNetwork={isInTheWrongNetwork}
              setToast={setToast}
              show={isOwner}
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
                  openSeaApiKey: OPENSEA_API_KEY,
                }}
                setToast={setToast}
              />
            )}
          </div>
        </div>
        <div
          className={`${
            (isOwner && isListed) || isTopBidder ? 'mt-6' : ''
          } flex justify-center`}
        >
          <CancelOffer
            data={{
              collection: collection.data,
              details,
            }}
            maker={accountData?.address.toLowerCase()}
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
            maker={accountData?.address.toLowerCase()}
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
      <div className="reservoir-h5 dark:text-white">{title}</div>
      <div>{source}</div>
    </div>
    <div className="reservoir-h3 dark:text-white">{price}</div>
  </div>
)
