import Layout from 'components/Layout'
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
import { paths } from '@reservoir0x/client-sdk'

// Environment variables
// For more information about these variables
// refer to the README.md file on this repository
// Reference: https://nextjs.org/docs/basic-features/environment-variables#exposing-environment-variables-to-the-browser
// REQUIRED
const chainId = process.env.NEXT_PUBLIC_CHAIN_ID
const RESERVOIR_API_BASE = process.env.NEXT_PUBLIC_RESERVOIR_API_BASE
const RESERVOIR_API_KEY = process.env.RESERVOIR_API_KEY

// OPTIONAL
const COLLECTION = process.env.NEXT_PUBLIC_COLLECTION
const COMMUNITY = process.env.NEXT_PUBLIC_COMMUNITY
const openSeaApiKey = process.env.NEXT_PUBLIC_OPENSEA_API_KEY

const META_TITLE = process.env.NEXT_PUBLIC_META_TITLE
const META_DESCRIPTION = process.env.NEXT_PUBLIC_META_DESCRIPTION
const META_OG_IMAGE = process.env.NEXT_PUBLIC_META_OG_IMAGE
const USE_WILDCARD = process.env.NEXT_PUBLIC_USE_WILDCARD

type Props = InferGetServerSidePropsType<typeof getServerSideProps>

const Index: NextPage<Props> = ({ collectionId, mode, communityId }) => {
  const [{ data: accountData }] = useAccount()
  const [{ data: signer }] = useSigner()
  const [{ data: network }] = useNetwork()
  const router = useRouter()
  useDataDog(accountData)
  const [tokenOpenSea, setTokenOpenSea] = useState<any>({
    animation_url: null,
    extension: null,
  })
  const collection = useCollection(undefined, collectionId)

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

  const details = useDetails({
    tokens: [
      `${router.query?.contract?.toString()}:${router.query?.tokenId?.toString()}`,
    ],
  })

  if (details.error || !chainId) {
    console.debug({ chainId })
    return <div>There was an error</div>
  }

  const token = details.data?.tokens?.[0]
  const isOwner =
    token?.token?.owner?.toLowerCase() === accountData?.address.toLowerCase()
  const isTopBidder =
    !!accountData &&
    token?.market?.topBid?.maker?.toLowerCase() ===
      accountData?.address?.toLowerCase()
  const isListed = token?.market?.floorAsk?.price !== null
  const isInTheWrongNetwork = signer && network.chain?.id !== +chainId

  const setToast: (data: ComponentProps<typeof Toast>['data']) => any = (
    data
  ) => toast.custom((t) => <Toast t={t} toast={toast} data={data} />)

  const title = META_TITLE ? (
    <title>{META_TITLE}</title>
  ) : (
    <title>
      {token?.token?.name || `#${token?.token?.tokenId}`} -{' '}
      {collection.data?.collection?.name} | Reservoir Market
    </title>
  )
  const description = META_DESCRIPTION ? (
    <meta name="description" content={META_DESCRIPTION} />
  ) : (
    <meta
      name="description"
      content={collection.data?.collection?.metadata?.description as string}
    />
  )
  const image = META_OG_IMAGE ? (
    <>
      <meta name="twitter:image" content={META_OG_IMAGE} />
      <meta name="og:image" content={META_OG_IMAGE} />
    </>
  ) : (
    <>
      <meta name="twitter:image" content={token?.token?.image} />
      <meta property="og:image" content={token?.token?.image} />
    </>
  )

  const owner =
    token?.token?.kind === 'erc1155' && token?.market?.floorAsk?.maker
      ? token?.market?.floorAsk?.maker
      : token?.token?.owner

  return (
    <Layout navbar={{ mode, communityId }}>
      <Head>
        {title}
        {description}
        {image}
        {/* <script
          type="module"
          src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"
        ></script>
        <script
          noModule
          src="https://unpkg.com/@google/model-viewer/dist/model-viewer-legacy.js"
        ></script> */}
      </Head>
      {/* TOKEN IMAGE */}
      <article className="col-span-full grid content-start items-start gap-4 md:col-span-4 lg:col-span-5 lg:col-start-2">
        {/* TEST MODEL-VIEWER WITH LOCAL FILES */}
        {/* <model-viewer
          alt="Neil Armstrong's Spacesuit from the Smithsonian Digitization Programs Office and National Air and Space Museum"
          src="/NeilArmstrong.glb"
          ar
          ar-modes="webxr scene-viewer quick-look"
          environment-image="https://modelviewer.dev/shared-assets/environments/moon_1k.hdr"
          poster="/NeilArmstrong.webp"
          seamless-poster
          shadow-intensity="1"
          camera-controls
          enable-pan
        ></model-viewer> */}
        {tokenOpenSea?.extension === null ? (
          <img
            className="w-full rounded-2xl"
            src={optimizeImage(token?.token?.image, 533)}
          />
        ) : (
          <Media
            tokenOpenSea={tokenOpenSea}
            tokenImage={optimizeImage(token?.token?.image, 533)}
          />
        )}
        <article className="col-span-full rounded-2xl border-[1px] border-gray-300 bg-white p-6">
          <div className="reservoir-h6 mb-4">Owner</div>
          {owner && (
            <Link href={`/address/${owner}`}>
              <a className="inline-block">
                <EthAccount address={owner} />
              </a>
            </Link>
          )}
        </article>
      </article>
      <div className="col-span-full grid gap-4 md:col-span-4 lg:col-span-5">
        <article className="col-span-full rounded-2xl border-[1px] border-gray-300 bg-white p-6">
          <div className="reservoir-h2 mb-3 overflow-hidden">
            {token?.token?.name || `#${token?.token?.tokenId}`}
          </div>
          <div className="reservoir-h6 mb-2">Collection</div>
          <Link
            href={
              mode === 'collection'
                ? '/'
                : `/collections/${collection.data?.collection?.id}`
            }
          >
            <a className="reservoir-body mb-1 inline-flex items-center gap-2">
              <img
                src={optimizeImage(
                  collection.data?.collection?.metadata?.imageUrl as string,
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
        <article className="col-span-full rounded-2xl border-[1px] border-gray-300 bg-white p-6">
          <div className="grid grid-cols-2 gap-8">
            <Price
              title="List Price"
              price={
                <FormatEth
                  amount={token?.market?.floorAsk?.price}
                  maximumFractionDigits={4}
                  logoWidth={20}
                />
              }
            >
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
            </Price>
            <Price
              title="Top Offer"
              price={
                <FormatEth
                  amount={token?.market?.topBid?.value}
                  maximumFractionDigits={4}
                  logoWidth={20}
                />
              }
            >
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
                    recipient:
                      collection.data?.collection?.royalties?.recipient,
                  }}
                  env={{
                    chainId: +chainId as ChainId,
                    openSeaApiKey,
                  }}
                  setToast={setToast}
                />
              )}
            </Price>
          </div>
          <div className="mt-6 flex justify-center">
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
        <TokenAttributes token={token?.token} />
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
  communityId?: string
}> = async ({ req, params }) => {
  const options: RequestInit | undefined = {}

  if (RESERVOIR_API_KEY) {
    options.headers = {
      'x-api-key': RESERVOIR_API_KEY,
    }
  }

  const { mode, collectionId: communityId } = getMode(
    req,
    USE_WILDCARD,
    COMMUNITY,
    COLLECTION
  )

  const url = new URL('/tokens/details/v3', RESERVOIR_API_BASE)

  const query: paths['/tokens/details/v3']['get']['parameters']['query'] = {
    tokens: [`${params?.contract?.toString()}:${params?.tokenId?.toString()}`],
  }

  const href = setParams(url, query)

  const res = await fetch(href, options)

  const tokenDetails =
    (await res.json()) as paths['/tokens/details/v3']['get']['responses']['200']['schema']

  const collectionId = tokenDetails.tokens?.[0]?.token?.collection?.id

  if (!collectionId) {
    return {
      notFound: true,
    }
  }

  return { props: { collectionId, mode, communityId } }
}

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

  // 3D
  // if (extension === 'gltf' || extension === 'glb') {
  //   return (
  //     <div>
  //       <model-viewer
  //         src={animation_url}
  //         ar
  //         ar-modes="webxr scene-viewer quick-look"
  //         environment-image="https://modelviewer.dev/shared-assets/environments/moon_1k.hdr"
  //         poster="/NeilArmstrong.webp"
  //         seamless-poster
  //         shadow-intensity="1"
  //         camera-controls
  //         enable-pan
  //       ></model-viewer>
  //     </div>
  //   )
  // }

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
