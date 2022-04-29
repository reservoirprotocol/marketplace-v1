import Layout from 'components/Layout'
import setParams from 'lib/params'
import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from 'next'
import { useRouter } from 'next/router'
import { useAccount } from 'wagmi'
import TokenAttributes from 'components/TokenAttributes'
import useDataDog from 'hooks/useAnalytics'
import Head from 'next/head'
import getMode from 'lib/getMode'
import useDetails from 'hooks/useDetails'
import useCollection from 'hooks/useCollection'
import { paths } from '@reservoir0x/client-sdk'
import useAsks from 'hooks/useAsks'
import Listings from 'components/token/Listings'
import TokenInfo from 'components/token/TokenInfo'
import CollectionInfo from 'components/token/CollectionInfo'
import Owner from 'components/token/Owner'
import PriceData from 'components/token/PriceData'
import TokenMedia from 'components/token/TokenMedia'

// Environment variables
// For more information about these variables
// refer to the README.md file on this repository
// Reference: https://nextjs.org/docs/basic-features/environment-variables#exposing-environment-variables-to-the-browser
// REQUIRED
const RESERVOIR_API_BASE = process.env.NEXT_PUBLIC_RESERVOIR_API_BASE
const RESERVOIR_API_KEY = process.env.RESERVOIR_API_KEY

// OPTIONAL
const COLLECTION = process.env.NEXT_PUBLIC_COLLECTION
const COMMUNITY = process.env.NEXT_PUBLIC_COMMUNITY

const META_TITLE = process.env.NEXT_PUBLIC_META_TITLE
const META_DESCRIPTION = process.env.NEXT_PUBLIC_META_DESCRIPTION
const META_OG_IMAGE = process.env.NEXT_PUBLIC_META_OG_IMAGE
const USE_WILDCARD = process.env.NEXT_PUBLIC_USE_WILDCARD

type Props = InferGetServerSidePropsType<typeof getServerSideProps>

const Index: NextPage<Props> = ({ collectionId, mode, communityId }) => {
  const [{ data: accountData }] = useAccount()
  const router = useRouter()

  useDataDog(accountData)

  const collection = useCollection(undefined, collectionId)

  const details = useDetails({
    tokens: [
      `${router.query?.contract?.toString()}:${router.query?.tokenId?.toString()}`,
    ],
  })

  const asks = useAsks(
    undefined,
    details.data?.tokens?.[0]?.token?.kind,
    `${details.data?.tokens?.[0]?.token?.contract}:${details.data?.tokens?.[0]?.token?.tokenId}`
  )

  if (details.error) {
    return <div>There was an error</div>
  }

  const token = details.data?.tokens?.[0]

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

  return (
    <Layout navbar={{ mode, communityId }}>
      <Head>
        {title}
        {description}
        {image}
      </Head>
      <div className="col-span-full content-start space-y-4 px-2 md:col-span-4 lg:col-span-5 lg:col-start-2 lg:px-0 2xl:col-span-4 2xl:col-start-3 3xl:col-start-5 4xl:col-start-7">
        <div className="mb-4">
          <TokenMedia details={details} />
        </div>
        <div className="hidden space-y-4 md:block">
          <CollectionInfo
            collection={collection}
            details={details}
            mode={mode}
          />
          <TokenInfo details={details} />
        </div>
      </div>
      <div className="col-span-full mb-4 space-y-4 px-2 md:col-span-4 md:col-start-5 lg:col-span-5 lg:col-start-7 lg:px-0 2xl:col-span-4 2xl:col-start-7 3xl:col-start-9 4xl:col-start-11">
        <Owner details={details} />
        <PriceData details={details} collection={collection} />
        <Listings asks={asks} />
        <TokenAttributes token={token?.token} />
      </div>
      <div className="col-span-full block space-y-4 px-2 md:hidden lg:px-0">
        <CollectionInfo collection={collection} details={details} mode={mode} />
        <TokenInfo details={details} />
      </div>
    </Layout>
  )
}

export default Index

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

  const url = new URL('/tokens/details/v4', RESERVOIR_API_BASE)

  const query: paths['/tokens/details/v4']['get']['parameters']['query'] = {
    tokens: [`${params?.contract?.toString()}:${params?.tokenId?.toString()}`],
  }

  const href = setParams(url, query)

  const res = await fetch(href, options)

  const tokenDetails =
    (await res.json()) as paths['/tokens/details/v4']['get']['responses']['200']['schema']

  const collectionId = tokenDetails.tokens?.[0]?.token?.collection?.id

  if (!collectionId) {
    return {
      notFound: true,
    }
  }

  return { props: { collectionId, mode, communityId } }
}
