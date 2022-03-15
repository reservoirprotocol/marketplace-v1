import Layout from 'components/Layout'
import { paths } from 'interfaces/apiTypes'
import { optimizeImage } from 'lib/optmizeImage'
import setParams from 'lib/params'
import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from 'next'
import { useRouter } from 'next/router'
import { ComponentProps, FC, ReactNode, useEffect, useState } from 'react'
import { useAccount, useNetwork, useSigner } from 'wagmi'
import ListModal from 'components/ListModal'
import FormatEth from 'components/FormatEth'
import TokenAttributes from 'components/TokenAttributes'
import TokenOfferModal from 'components/TokenOfferModal'
import CancelListing from 'components/CancelListing'
import CancelOffer from 'components/CancelOffer'
import AcceptOffer from 'components/AcceptOffer'
import BuyNow from 'components/BuyNow'
import EthAccount from 'components/EthAccount'
import Link from 'next/link'
import useDataDog from 'hooks/useAnalytics'
import Head from 'next/head'
import getMode from 'lib/getMode'
import toast from 'react-hot-toast'
import Toast from 'components/Toast'
import useDetails from 'hooks/useDetails'
import useCollection from 'hooks/useCollection'

// Environment variables
// For more information about these variables
// refer to the README.md file on this repository
// Reference: https://nextjs.org/docs/basic-features/environment-variables#exposing-environment-variables-to-the-browser
// REQUIRED
const apiBase = process.env.NEXT_PUBLIC_API_BASE
const chainId = process.env.NEXT_PUBLIC_CHAIN_ID

// OPTIONAL
const collectionEnv = process.env.NEXT_PUBLIC_COLLECTION
const communityEnv = process.env.NEXT_PUBLIC_COMMUNITY
const openSeaApiKey = process.env.NEXT_PUBLIC_OPENSEA_API_KEY

type Props = InferGetServerSidePropsType<typeof getServerSideProps>

const Index: NextPage<Props> = ({ collectionId, mode }) => {
  const [{ data: accountData }] = useAccount()
  const [{ data: signer }] = useSigner()
  const [{ data: network }] = useNetwork()
  const router = useRouter()
  useDataDog(accountData)
  const [tokenOpenSea, setTokenOpenSea] = useState<any>({
    animation_url: null,
    extension: null,
  })

  const contract = router.query?.contract?.toString()
  const tokenId = router.query?.tokenId?.toString()

  const urlOpenSea = new URL(
    `/api/v1/asset/${contract}/${tokenId}`,
    'https://api.opensea.io/'
  )

  useEffect(() => {
    async function getOpenSeaData(url: URL) {
      let result: any = { animation_url: null, extension: null }
      try {
        const res = await fetch(url.href)
        const json = await res.json()

        const animation_url = json?.animation_url
        // Get the last section of the URL
        // lastPartOfUrl = '874f68834bdf5f05982d01067776acc2.wav' when input is
        // 'https://storage.opensea.io/files/874f68834bdf5f05982d01067776acc2.wav'
        const lastPartOfUrl = animation_url?.split('/')?.pop()
        // Extract the file extension from `lastPartOfUrl`, example: 'wav'
        let extension = null
        if (lastPartOfUrl) {
          extension = /(?:\.([^.]+))?$/.exec(lastPartOfUrl)?.[1]
        }

        result = { animation_url, extension }
      } catch (err) {
        console.error(err)
      }

      setTokenOpenSea(result)
    }

    getOpenSeaData(urlOpenSea)
  }, [])

  const details = useDetails(apiBase, {
    contract,
    tokenId,
  })
  const collection = useCollection(apiBase, undefined, collectionId)

  if (details.error || !apiBase || !chainId) {
    console.debug({ apiBase, chainId })
    return <div>There was an error</div>
  }

  const token = details.data?.tokens?.[0]
  const isOwner =
    token?.token?.owner?.toLowerCase() === accountData?.address.toLowerCase()
  const isTopBidder =
    !!accountData &&
    token?.market?.topBuy?.maker?.toLowerCase() ===
      accountData?.address?.toLowerCase()
  const isListed = token?.market?.floorSell?.value !== null
  const isInTheWrongNetwork = signer && network.chain?.id !== +chainId

  const setToast: (data: ComponentProps<typeof Toast>['data']) => any = (
    data
  ) => toast.custom((t) => <Toast t={t} toast={toast} data={data} />)

  return (
    <Layout>
      <Head>
        <title>
          {token?.token?.name || `#${token?.token?.tokenId}`} -{' '}
          {collection.data?.collection?.collection?.name} | Reservoir Market
        </title>
        <meta
          name="description"
          content={collection.data?.collection?.collection?.description}
        />
        <meta name="twitter:image" content={token?.token?.image} />
        <meta property="og:image" content={token?.token?.image} />
      </Head>
      <div className="mb-2 mt-9 grid  grid-cols-1 place-items-center gap-6 sm:mb-12 sm:grid-cols-2">
        {/* <Link href={`/collections/${collectionId}`}>
          <a className="reservoir-capitalized mt-9 flex items-center justify-self-start sm:col-span-2">
            <FiArrowLeft /> Back
          </a>
        </Link> */}
        <div className="ml-auto self-start">
          {/* TOKEN IMAGE */}
          {/* <img
            className="mb-4 w-[533px] rounded-2xl"
            src={optimizeImage(token?.token?.image, 533)}
          /> */}
          {tokenOpenSea?.extension === null ? (
            <img
              className="mb-4 w-[533px] rounded-2xl"
              src={optimizeImage(token?.token?.image, 533)}
            />
          ) : (
            <Media
              tokenOpenSea={tokenOpenSea}
              tokenImage={optimizeImage(token?.token?.image, 533)}
            />
          )}
          <article className="mb-6 max-w-[533px] overflow-hidden rounded-2xl border-[1px] border-gray-300 bg-white p-6">
            <div className="reservoir-h6 mb-4">Owner</div>
            {token?.token?.owner && (
              <Link href={`/address/${token.token.owner}`}>
                <a className="inline-block">
                  <EthAccount address={token.token.owner} />
                </a>
              </Link>
            )}
          </article>
        </div>

        <div className=" mb-8 self-start sm:mr-auto">
          <article className="mb-6 max-w-[533px] overflow-hidden rounded-2xl border-[1px] border-gray-300 bg-white p-6">
            <div className="reservoir-h2 mb-3 overflow-hidden">
              {token?.token?.name || `#${token?.token?.tokenId}`}
            </div>
            <div className="reservoir-h6 mb-2">Collection</div>
            <Link
              href={
                mode === 'collection' ? '/' : `/collections/${collectionId}`
              }
            >
              <a className="reservoir-body mb-1 flex items-center gap-2">
                <img
                  src={optimizeImage(
                    collection.data?.collection?.collection?.image,
                    50
                  )}
                  alt="collection avatar"
                  className="h-9 w-9 rounded-full"
                />
                <span className="reservoir-body">
                  {token?.token?.collection?.name}
                </span>
              </a>
            </Link>
          </article>
          <article className="mb-6 max-w-[533px] overflow-hidden rounded-2xl border-[1px] border-gray-300 bg-white p-6">
            <div className="grid grid-cols-2 gap-8">
              <Price
                title="List Price"
                price={
                  <FormatEth
                    amount={token?.market?.floorSell?.value}
                    maximumFractionDigits={4}
                    logoWidth={20}
                  />
                }
              >
                {isOwner && (
                  <ListModal
                    apiBase={apiBase}
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
                  apiBase={apiBase}
                  data={{
                    collection: collection.data,
                    details,
                  }}
                  signer={signer}
                  isInTheWrongNetwork={isInTheWrongNetwork}
                  setToast={setToast}
                  show={!isOwner}
                />
              </Price>
              <Price
                title="Top Offer"
                price={
                  <FormatEth
                    amount={token?.market?.topBuy?.value}
                    maximumFractionDigits={4}
                    logoWidth={20}
                  />
                }
              >
                <AcceptOffer
                  apiBase={apiBase}
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
                      recipient:
                        collection.data?.collection?.royalties?.recipient,
                    }}
                    env={{
                      apiBase,
                      chainId: +chainId as ChainId,
                      openSeaApiKey,
                    }}
                    setToast={setToast}
                  />
                )}
              </Price>
            </div>
            <div className="flex justify-center">
              <CancelOffer
                apiBase={apiBase}
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
                apiBase={apiBase}
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
          <TokenAttributes token={token?.token} />
        </div>
      </div>
    </Layout>
  )
}

export default Index

const Price: FC<{ title: string; price: ReactNode }> = ({
  title,
  price,
  children,
}) => (
  <div className="grid space-y-5">
    <div className="reservoir-h5">{title}</div>
    <div className="reservoir-h1">{price}</div>
    {children}
  </div>
)

export const getServerSideProps: GetServerSideProps<{
  collectionId: string
  mode: ReturnType<typeof getMode>['mode']
}> = async ({ req, params }) => {
  const { mode } = getMode(req, communityEnv, collectionEnv)

  const url = new URL('/tokens/details', apiBase)

  const query: paths['/tokens/details']['get']['parameters']['query'] = {
    contract: params?.contract?.toString(),
    tokenId: params?.tokenId?.toString(),
  }

  setParams(url, query)

  const res = await fetch(url.href)

  const tokenDetails =
    (await res.json()) as paths['/tokens/details']['get']['responses']['200']['schema']

  const collectionId = tokenDetails.tokens?.[0]?.token?.collection?.id

  if (!collectionId) {
    return {
      notFound: true,
    }
  }

  return { props: { collectionId, mode } }
}

import React from 'react'
import { FiArrowLeft } from 'react-icons/fi'

const Media: FC<{
  tokenOpenSea: {
    animation_url: any
    extension: any
  }
  tokenImage: string
}> = ({ tokenOpenSea, tokenImage }) => {
  const { animation_url, extension } = tokenOpenSea

  // VIDEO
  if (extension === 'mp4') {
    return (
      <video className="mb-4 w-[533px]" controls>
        <source src={animation_url} type="video/mp4" />
        Your browser does not support the
        <code>video</code> element.
      </video>
    )
  }

  // AUDIO
  if (extension === 'wav' || extension === 'mp3') {
    return (
      <div>
        <img className="mb-4 w-[533px] rounded-2xl" src={tokenImage} />
        <audio className="mb-4 w-full" controls src={animation_url}>
          Your browser does not support the
          <code>audio</code> element.
        </audio>
      </div>
    )
  }

  // HTML
  if (extension === 'html' || extension === undefined) {
    return (
      <iframe
        className="mb-6 aspect-square w-full"
        height="533"
        width="533"
        src={animation_url}
      ></iframe>
    )
  }

  return null
}
