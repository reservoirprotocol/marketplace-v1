import Layout from 'components/Layout'
import setParams from 'lib/params'
import { fetchFromContract } from 'lib/fetchFromContract'
import { GetStaticPaths, GetServerSideProps, NextPage } from 'next'
import { useRouter } from 'next/router'
import TokenAttributes from 'components/TokenAttributes'
import Head from 'next/head'
import { paths } from '@reservoir0x/reservoir-kit-client'
import Listings from 'components/token/Listings'
import TokenInfo from 'components/token/TokenInfo'
import CollectionInfo from 'components/token/CollectionInfo'
import Owner from 'components/token/Owner'
import PriceData from 'components/token/PriceData'
import TokenMedia from 'components/token/TokenMedia'
import { useEffect, useState } from 'react'
import { TokenDetails } from 'types/reservoir'
import {
  useTokenOpenseaBanned,
  useTokens,
  useCollections,
  useUserTokens,
} from '@reservoir0x/reservoir-kit-ui'
import { useAccount } from 'wagmi'
import getIconFromTokenDetails from 'lib/getIconFromAttributes'
import getShorthandFrequencyFromTokenDetails from 'lib/getShorthandFrequencyFromTokenDetails'
import useInterval from 'hooks/useInterval'
import getAttributeFromTokenDetails from 'lib/getAttributeFromTokenDetails'

// Environment variables
// For more information about these variables
// refer to the README.md file on this repository
// Reference: https://nextjs.org/docs/basic-features/environment-variables#exposing-environment-variables-to-the-browser
// REQUIRED
const RESERVOIR_API_BASE = process.env.NEXT_PUBLIC_RESERVOIR_API_BASE
const RESERVOIR_API_KEY = process.env.NEXT_PUBLIC_RESERVOIR_API_KEY
const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID

// OPTIONAL
const META_TITLE = process.env.NEXT_PUBLIC_META_TITLE
const META_DESCRIPTION = process.env.NEXT_PUBLIC_META_DESCRIPTION
// NOTE: this feels like a bug in the reservoir code. why would we want the
// site-wide image to overwrite the specific image from the token page? setting to null
const META_OG_IMAGE = null

const COLLECTION = process.env.NEXT_PUBLIC_COLLECTION
const COMMUNITY = process.env.NEXT_PUBLIC_COMMUNITY
const COLLECTION_SET_ID = process.env.NEXT_PUBLIC_COLLECTION_SET_ID
const PROXY_API_BASE = process.env.NEXT_PUBLIC_PROXY_API_BASE

const FINILIAR_API = process.env.NEXT_PUBLIC_FINILIAR_API || "https://api.finiliar.com"

interface AdditionalMetadata {
  background: string,
  latestDelta: number,
  latestPrice: number
}

type Props = {
  collectionId: string
  tokenDetails?: TokenDetails,
  additionalMetadata?: AdditionalMetadata
}

const metadata = {
  title: (title: string) => (
    <>
      <title>{title}</title>
      <meta property="twitter:title" content={title} />
      <meta property="og:title" content={title} />
    </>
  ),
  description: (description: string) => (
    <>
      <meta name="description" content={description} />
      <meta name="twitter:description" content={description} />
      <meta property="og:description" content={description} />
    </>
  ),
  image: (image: string) => (
    <>
      <meta name="twitter:image" content={image} />
      <meta property="og:image" content={image} />
    </>
  ),
  tagline: (tagline: string | undefined) => (
    <>{tagline || 'Discover, buy and sell NFTs'}</>
  ),
}

const Index: NextPage<Props> = ({ collectionId, tokenDetails, additionalMetadata }) => {  
  const [tokenOpenSea] = useState<any>({
    animation_url: null,
    extension: null,
  })
  // these will be referenced throughout, will update on an interval via poll, and
  // will be initialized with the values passed in
  const [freshAdditionalMetadata, setFreshAdditionalMetadata] = useState(additionalMetadata)
  const [freshTokenDetails, setFreshAdditionalTokenDetails] = useState(tokenDetails)
  
  const account = useAccount()
  const router = useRouter()
  const bannedOnOpenSea = useTokenOpenseaBanned(
    collectionId,
    router.query?.tokenId?.toString() || ''
  )

  const collectionResponse = useCollections({ id: collectionId })
  const collection =
    collectionResponse.data && collectionResponse.data[0]
      ? collectionResponse.data[0]
      : undefined

  const tokenData = useTokens({
    tokens: [
      `${router.query?.contract?.toString()}:${router.query?.tokenId?.toString()}`,
    ],
    includeTopBid: true,
    includeAttributes: true,
  })


  const tokens = tokenData.data
  const token = tokens?.[0] || { token: freshTokenDetails }
  
  if (token.token) {
    token.token.image = freshTokenDetails?.image;
  }
  const checkUserOwnership = token.token?.kind === 'erc1155'
  const { data: userTokens } = useUserTokens(
    checkUserOwnership ? account.address : undefined,
    {
      tokens: [
        `${router.query?.contract?.toString()}:${router.query?.tokenId?.toString()}`,
      ],
    }
  )

  useEffect(() => {
    if (CHAIN_ID && (+CHAIN_ID === 1 || +CHAIN_ID === 5)) {
      const baseUrl =
        +CHAIN_ID === 1
          ? 'https://api.opensea.io'
          : 'https://testnets-api.opensea.io'
      fetch(
        `${baseUrl}/api/v1/asset/${collectionId}/${router.query?.tokenId?.toString()}/offers`
      ).then(async (data) => {
        const response = await data.json()
        fetch(`${PROXY_API_BASE}/seaport/offers`, {
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
          body: JSON.stringify(response),
        })
      })
    }
  }, [])

  useInterval(async () => {
    if (!tokenDetails?.image) return
    // TODO: this code repeats getServerSideProps, can we consolidate?
    const metadata = await (await fetch(FINILIAR_API + "/metadata/" + tokenDetails.tokenId)).json()
    console.log('Fresh data:', metadata)
    
    // conditionally add an updated gif
    if (tokenDetails.image !== metadata.image) {
      tokenDetails.image = metadata.image
      setFreshAdditionalTokenDetails(tokenDetails)
    }
    
    // conditionall add updated additionalMetadata
    const addMetadata = {
      background: metadata.background,
      latestDelta: metadata.latestDelta,
      latestPrice: metadata.latestPrice
    }
    if (addMetadata !== additionalMetadata) setFreshAdditionalMetadata(addMetadata)
    
  }, 60000) // 60 seconds

  if (tokenData.error) {
    return <div>There was an error</div>
  }

  const tokenName = `${token?.token?.name || `#${token?.token?.tokenId}`}`

  // META
  const title = META_TITLE
    ? metadata.title(`${tokenName} - ${META_TITLE}`)
    : metadata.title(`${tokenName} - 
    ${token?.token?.collection?.name}`)

  const description = META_DESCRIPTION
    ? metadata.description(META_DESCRIPTION)
    : token?.token?.description
    ? metadata.description(token?.token?.description)
    : null

  const image = META_OG_IMAGE
    ? metadata.image(META_OG_IMAGE)
    : token?.token?.image
    ? metadata.image(token?.token?.image)
    : null

  const isOwner =
    userTokens &&
    userTokens[0] &&
    userTokens[0].ownership?.tokenCount &&
    +userTokens[0].ownership.tokenCount > 0
      ? true
      : token?.token?.owner?.toLowerCase() === account?.address?.toLowerCase()

  const icon = getIconFromTokenDetails(tokenDetails!)
  const freqShorthand = getShorthandFrequencyFromTokenDetails(tokenDetails!)

  return (
    <Layout navbar={{}} className="bg-primary-300">
      <Head>
        {title}
        {description}
        {image}
      </Head>
      <div className="col-span-full">
        <div className="mb-4 relative" style={{ background: freshAdditionalMetadata?.background }}>
          {/* <div className="z-10 m-auto top-0 absolute inline-flex space-x-4 p-4 items-center px-6 md:px-16">
              <div className="rounded-lg bg-[#ffffffa8] p-1 inline-flex items-center">
                <img src={icon} className="h-[14px] mr-2" alt="Currency icon" />
                <span>${freshAdditionalMetadata?.latestPrice.toFixed(2)}</span>
              </div>
              <div
                style={{ color: freshAdditionalMetadata?.latestDelta! < 0 ? 'red' : 'green'}}
                className="rounded-lg bg-[#ffffffa8] p-1"
              >
                {freshAdditionalMetadata?.latestDelta! > 0 && <span>+</span>}
                {freshAdditionalMetadata?.latestDelta.toFixed(2)}% past {freqShorthand}
              </div>
          </div> */}
          <div className="max-w-[600px] m-auto min-h-[600px] flex items-center">
            <TokenMedia token={token.token} />
          </div>
        </div>
      </div>
      <div className="col-span-full content-start space-y-4 px-2 pt-4 md:col-span-4 lg:col-span-5 lg:col-start-2 lg:px-0 2xl:col-span-4 2xl:col-start-3 3xl:col-start-5 4xl:col-start-7">
        <div className="pb-4 md:pb-0">
          <Owner details={token} bannedOnOpenSea={bannedOnOpenSea} />
        </div>
        <div className="hidden space-y-4 md:block">
          {/* <CollectionInfo collection={collection} token={token.token} /> */}
          <TokenAttributes
            token={token?.token}
            collection={collection}
            isOwner={isOwner}
          />
        </div>
      </div>
      <div className="col-span-full mb-4 space-y-4 px-2 pt-0 md:col-span-4 md:col-start-5 md:pt-4 lg:col-span-5 lg:col-start-7 lg:px-0 2xl:col-span-5 2xl:col-start-7 3xl:col-start-9 4xl:col-start-11">
        <div className="col-span-full rounded-[25px] bg-primary-100 pill p-6">
          <div className="reservoir-h4">Live data</div>
          <div className="bg-primary-600 flex flex-col text-primary-800 rounded-xl p-5 mt-3 max-w-[300px]">
            <span className="text-sm mb-2">{getAttributeFromTokenDetails(tokenDetails!, 'Family')}</span>
            <span className="reservoir-h4 text-primary-800">${freshAdditionalMetadata?.latestPrice.toFixed(2)}</span>
            <div
              className={"mt-2 text-md " + (freshAdditionalMetadata?.latestDelta! < 0 ? 'text-primary-900' : 'text-primary-500')}
            >
              {freshAdditionalMetadata?.latestDelta! > 0 && <span>+</span>}
              {freshAdditionalMetadata?.latestDelta.toFixed(2)}% past {freqShorthand}
            </div>
          </div>
        </div>
        <PriceData
          details={tokenData}
          collection={collection}
          isOwner={isOwner}
        />
        {token.token?.kind === 'erc1155' && (
          <Listings
            token={`${router.query?.contract?.toString()}:${router.query?.tokenId?.toString()}`}
          />
        )}
        {/* <TokenInfo token={token.token} /> */}
      </div>
      <div className="col-span-full block space-y-4 px-2 md:hidden lg:px-0">
        {/* <CollectionInfo collection={collection} token={token.token} /> */}
        <TokenAttributes
            token={token?.token}
            collection={collection}
            isOwner={isOwner}
          />
        {/* <TokenInfo token={token.token} /> */}
      </div>
    </Layout>
  )
}

export default Index

// NOTE: we switched to using getServerSideProps so that the server rerenders this page
// each time it's called. We do this bc we need the unfurled image links to be fresh.
export const getServerSideProps: GetServerSideProps<{
  collectionId: string
  communityId?: string
}> = async ({ params }) => {
  const contract = params?.contract?.toString()
  const tokenId = params?.tokenId?.toString()
  const collectionAddress = COLLECTION ? COLLECTION.split(':')[0] : COLLECTION

  if (
    collectionAddress &&
    !COMMUNITY &&
    !COLLECTION_SET_ID &&
    collectionAddress.toLowerCase() !== contract?.toLowerCase()
  ) {
    return {
      notFound: true,
    }
  }

  const options: RequestInit | undefined = {}

  if (RESERVOIR_API_KEY) {
    options.headers = {
      'x-api-key': RESERVOIR_API_KEY,
    }
  }

  const url = new URL('/tokens/v5', RESERVOIR_API_BASE)

  const query: paths['/tokens/v5']['get']['parameters']['query'] = {
    tokens: [`${contract}:${tokenId}`],
    includeTopBid: true,
    includeAttributes: true,
  }

  const href = setParams(url, query)

  const res = await fetch(href, options)

  const data =
    (await res.json()) as paths['/tokens/v5']['get']['responses']['200']['schema']
  

  const tokenDetails = data?.tokens?.[0]?.token;

  if (!tokenDetails) {
    return {
      notFound: true,
    }
  }

  const metadata = await (await fetch(FINILIAR_API + "/metadata/" + tokenDetails.tokenId)).json()
  tokenDetails.image = metadata.image

  // pass additional metadata we got from our own server
  const additionalMetadata = {
    background: metadata.background,
    latestDelta: metadata.latestDelta,
    latestPrice: metadata.latestPrice
  }

  const collectionId = data.tokens?.[0]?.token?.collection?.id

  if (!collectionId) {
    return {
      notFound: true,
    }
  }

  return {
    props: { collectionId, tokenDetails, additionalMetadata },
  }
}
