import Layout from 'components/Layout'
import { paths } from 'interfaces/apiTypes'
import setParams from 'lib/params'
import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from 'next'
import TokensGrid from 'components/TokensGrid'
import Hero from 'components/Hero'
import { useNetwork, useSigner } from 'wagmi'
import OfferModal from 'components/OfferModal'
import CommunityGrid from 'components/CommunityGrid'
import CollectionsGrid from 'components/CollectionsGrid'
import SearchCollection from 'components/SearchCollections'
import Sidebar from 'components/Sidebar'
import { useRouter } from 'next/router'
import useTokens from 'hooks/useTokens'
import useCommunity from 'hooks/useCommunity'
import useCollections from 'hooks/useCollections'
import useCollection from 'hooks/useCollection'
import useAttributes from 'hooks/useAttributes'
import useGetOpenSeaMetadata from 'hooks/useGetOpenSeaMetadata'

const apiBase = process.env.NEXT_PUBLIC_API_BASE
const chainId = process.env.NEXT_PUBLIC_CHAIN_ID
const openSeaApiKey = process.env.NEXT_PUBLIC_OPENSEA_API_KEY

type Props = InferGetServerSidePropsType<typeof getServerSideProps>

const Home: NextPage<Props> = ({ wildcard, isCommunity, isHome }) => {
  const [{ data: signer }] = useSigner()
  const [{ data: network }] = useNetwork()
  const router = useRouter()

  const { tokens, ref } = useTokens(apiBase, wildcard, [], router)

  const communities = useCommunity(apiBase, wildcard)

  const collections = useCollections(apiBase)

  const collection = useCollection(apiBase, undefined, wildcard)

  const attributes = useAttributes(apiBase, wildcard)

  const { data: openSeaMeta } = useGetOpenSeaMetadata(wildcard)

  if (
    tokens.error ||
    communities.error ||
    collections.error ||
    collection.error ||
    attributes.error ||
    !apiBase ||
    !chainId
  ) {
    console.debug({
      apiBase,
      chainId,
      tokens,
      communities,
      collections,
      collection,
      attributes,
    })
    return <div>There was an error</div>
  }

  const stats = {
    vol24: 10,
    count: collection?.data?.collection?.set?.tokenCount,
    topOffer: collection?.data?.collection?.set?.market?.topBuy?.value,
    floor: collection?.data?.collection?.set?.market?.floorSell?.value,
  }

  const header = {
    banner: openSeaMeta?.collection?.banner_image_url,
    image: collection?.data?.collection?.collection?.image,
    name: collection?.data?.collection?.collection?.name,
  }

  const royalties = {
    bps: collection.data?.collection?.royalties?.bps,
    recipient: collection.data?.collection?.royalties?.recipient,
  }

  const env = {
    apiBase,
    chainId: +chainId,
    openSeaApiKey,
  }

  const isInTheWrongNetwork = signer && network.chain?.id !== env.chainId

  const data = {
    // COLLECTION WIDE OFFER
    collection: {
      id: collection?.data?.collection?.collection?.id,
      image: collection?.data?.collection?.collection?.image,
      name: collection?.data?.collection?.collection?.name,
      tokenCount: collection?.data?.collection?.set?.tokenCount ?? 0,
    },
    token: {
      contract: undefined,
      id: undefined,
      image: undefined,
      name: undefined,
      topBuyValue: undefined,
      floorSellValue: undefined,
    },
  }

  const layoutData = {
    title: isHome ? undefined : collection.data?.collection?.collection?.name,
    image: isHome ? undefined : collection.data?.collection?.collection?.image,
  }

  return (
    <Layout title={layoutData?.title} image={layoutData?.image}>
      {isHome ? (
        <>
          <header className="mb-10 flex items-center justify-center gap-5">
            <h1 className="mt-12 text-3xl font-bold">
              Discover, buy and sell NFTs
            </h1>
          </header>
          <div className="mb-12 grid justify-center">
            <SearchCollection apiBase={apiBase} />
          </div>
          <CollectionsGrid collections={collections} />
        </>
      ) : isCommunity ? (
        <>
          <header className="mt-8 mb-14 flex items-center justify-center gap-5">
            <img
              className="h-[50px] w-[50px]"
              src={communities.data?.collections?.[0].collection?.image}
            />
            <h1 className=" text-xl font-bold uppercase">
              {wildcard} Community
            </h1>
          </header>
          <CommunityGrid communities={communities} />
        </>
      ) : (
        <>
          <Hero stats={stats} header={header} />
          <div className="mt-3 mb-10 flex justify-center">
            <OfferModal
              trigger={
                <button
                  className="btn-neutral-fill-dark px-11 py-4"
                  disabled={!signer || isInTheWrongNetwork}
                >
                  Make a collection bid
                </button>
              }
              royalties={royalties}
              signer={signer}
              data={data}
              env={env}
              mutate={collection.mutate}
            />
          </div>
          <div className="flex gap-5">
            <Sidebar attributes={attributes} setTokensSize={tokens.setSize} />
            <TokensGrid
              tokenCount={data.collection.tokenCount}
              tokens={tokens}
              viewRef={ref}
            />
          </div>
        </>
      )}
    </Layout>
  )
}

export default Home

export const getServerSideProps: GetServerSideProps<{
  wildcard: string
  isCommunity: boolean
  isHome: boolean
}> = async ({ req }) => {
  const hostParts = req.headers.host?.split('.').reverse()
  // Make sure that the host contains at least one subdomain
  // ['subdomain', 'domain', 'TLD']
  // Reverse the host parts to make sure that the third element always
  // corresponds to the first subdomain
  // ['TLD', 'domain', 'subdomain1', 'subdomain2']
  if (!hostParts || hostParts.length < 2) {
    return {
      notFound: true,
    }
  }

  if (!apiBase) {
    console.debug('There are missing environment variables', {
      apiBase,
    })
    return {
      notFound: true,
    }
  }

  // In development: hostParts = ['localhost:3000', 'subdomain1', 'subdomain2']
  // In production: hostParts = ['TLD', 'domain', 'subdomain1', 'subdomain2']
  const wildcard =
    hostParts[0] === 'localhost:3000' ? hostParts[1] : hostParts[2]

  // Check the wildcard corresponds to a community
  const url = new URL('/collections', apiBase)

  const query: paths['/collections']['get']['parameters']['query'] = {
    community: wildcard,
  }

  setParams(url, query)

  let isCommunity: boolean = false

  try {
    const res = await fetch(url.href)
    const collections =
      (await res.json()) as paths['/collections']['get']['responses']['200']['schema']
    if (collections.collections) {
      isCommunity = collections.collections.length > 0
    }
  } catch (error) {
    return {
      notFound: true,
    }
  }

  const isHome: boolean = wildcard === 'www'

  return { props: { wildcard, isCommunity, isHome } }
}
