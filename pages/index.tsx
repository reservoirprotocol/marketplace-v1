import Layout from 'components/Layout'
import { paths } from 'interfaces/apiTypes'
import setParams from 'lib/params'
import useSWRInfinite, { SWRInfiniteKeyLoader } from 'swr/infinite'
import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from 'next'
import fetcher from 'lib/fetcher'
import TokensGrid from 'components/TokensGrid'
import { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import Hero from 'components/Hero'
import useSWR from 'swr'
import { useNetwork, useSigner } from 'wagmi'
import OfferModal from 'components/OfferModal'
import CommunityGrid from 'components/CommunityGrid'
import CollectionsGrid from 'components/CollectionsGrid'
import SearchCollection from 'components/SearchCollections'

const apiBase = process.env.NEXT_PUBLIC_API_BASE
const chainId = process.env.NEXT_PUBLIC_CHAIN_ID
const openSeaApiKey = process.env.NEXT_PUBLIC_OPENSEA_API_KEY
const nodeEnv = process.env.NODE_ENV

type InfiniteKeyLoader = (
  url: URL,
  wildcard: string,
  ...base: Parameters<SWRInfiniteKeyLoader>
) => ReturnType<SWRInfiniteKeyLoader>

const getKey: InfiniteKeyLoader = (
  url: URL,
  wildcard: string,
  index: number,
  previousPageData: paths['/tokens']['get']['responses']['200']['schema']
) => {
  if (!apiBase) {
    console.debug('There are missing environment variables', {
      apiBase,
    })
    return null
  }

  // Reached the end
  if (previousPageData && previousPageData?.tokens?.length === 0) return null

  let query: paths['/tokens']['get']['parameters']['query'] = {
    limit: 20,
    offset: index * 20,
    collection: wildcard,
  }

  setParams(url, query)

  return url.href
}

const getKeyCommunity: InfiniteKeyLoader = (
  url: URL,
  wildcard: string,
  index: number,
  previousPageData: paths['/collections']['get']['responses']['200']['schema']
) => {
  if (!apiBase) {
    console.debug('There are missing environment variables', {
      apiBase,
    })
    return null
  }

  // Reached the end
  if (previousPageData && previousPageData?.collections?.length === 0)
    return null

  let query: paths['/collections']['get']['parameters']['query'] = {
    limit: 20,
    offset: index * 20,
    community: wildcard,
  }

  setParams(url, query)

  return url.href
}

const getKeyCollections: (
  url: URL,
  ...base: Parameters<SWRInfiniteKeyLoader>
) => ReturnType<SWRInfiniteKeyLoader> = (
  url: URL,
  index: number,
  previousPageData: paths['/collections']['get']['responses']['200']['schema']
) => {
  if (!apiBase) {
    console.debug('There are missing environment variables', {
      apiBase,
    })
    return null
  }

  // Reached the end
  if (previousPageData && previousPageData?.collections?.length === 0)
    return null

  let query: paths['/collections']['get']['parameters']['query'] = {
    limit: 20,
    offset: index * 20,
    sortBy: 'floorCap',
    sortDirection: 'desc',
  }

  setParams(url, query)

  return url.href
}

type Props = InferGetServerSidePropsType<typeof getServerSideProps>

const Home: NextPage<Props> = ({ wildcard, isCommunity, isHome }) => {
  const { ref, inView } = useInView()
  const { ref: refCommunity, inView: inViewCommunity } = useInView()
  const { ref: refCollection, inView: inViewCollection } = useInView()
  const [{ data: signer }] = useSigner()
  const [{ data: network }] = useNetwork()

  const tokensUrl = new URL('/tokens', apiBase)

  const tokens = useSWRInfinite<
    paths['/tokens']['get']['responses']['200']['schema']
  >(
    (index, previousPageData) =>
      getKey(tokensUrl, wildcard, index, previousPageData),
    fetcher,
    {
      // solution only in beta
      // https://github.com/vercel/swr/pull/1538
      revalidateFirstPage: false,
      // revalidateOnMount: false,
    }
  )

  // Fetch more data when component is visible
  useEffect(() => {
    if (inView) {
      tokens.setSize(tokens.size + 1)
    }
  }, [inView])

  const communityUrl = new URL('/collections', apiBase)

  const communities = useSWRInfinite<
    paths['/collections']['get']['responses']['200']['schema']
  >(
    (index, previousPageData) =>
      getKeyCommunity(communityUrl, wildcard, index, previousPageData),
    fetcher,
    {
      // solution only in beta
      // https://github.com/vercel/swr/pull/1538
      revalidateFirstPage: false,
      // revalidateOnMount: false,
    }
  )

  // Fetch more data when component is visible
  useEffect(() => {
    if (inViewCommunity) {
      communities.setSize(communities.size + 1)
    }
  }, [inViewCommunity])

  const collectionsUrl = new URL('/collections', apiBase)

  const collections = useSWRInfinite<
    paths['/collections']['get']['responses']['200']['schema']
  >(
    (index, previousPageData) =>
      getKeyCollections(collectionsUrl, index, previousPageData),
    fetcher,
    {
      // solution only in beta
      // https://github.com/vercel/swr/pull/1538
      revalidateFirstPage: false,
      // revalidateOnMount: false,
    }
  )

  // Fetch more data when component is visible
  useEffect(() => {
    if (inViewCollection) {
      collections.setSize(collections.size + 1)
    }
  }, [inViewCollection])

  let url = new URL(`/collections/${wildcard}`, apiBase)

  const collection = useSWR<
    paths['/collections/{collection}']['get']['responses']['200']['schema']
  >(url.href, fetcher)

  if (tokens.error || !apiBase || !chainId || !openSeaApiKey) {
    console.debug({ apiBase }, { chainId })
    return <div>There was an error</div>
  }

  const stats = {
    vol24: 10,
    count: collection?.data?.collection?.set?.tokenCount,
    topOffer: collection?.data?.collection?.set?.market?.topBuy?.value,
    floor: collection?.data?.collection?.set?.market?.floorSell?.value,
  }

  const header = {
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
    title: isHome
      ? 'Sample Marketplace'
      : collection.data?.collection?.collection?.name,
    image: isHome ? undefined : collection.data?.collection?.collection?.image,
  }

  return (
    <Layout title={layoutData?.title} image={layoutData?.image}>
      {isHome ? (
        <>
          <header className="mb-10 flex items-center justify-center gap-5">
            <h1 className="mt-12 text-3xl font-bold uppercase">
              Welcome to our sample marketplace!
            </h1>
          </header>
          <div className="mb-12 grid justify-center">
            <SearchCollection apiBase={apiBase} />
          </div>
          <CollectionsGrid collections={collections} viewRef={refCollection} />
        </>
      ) : isCommunity ? (
        <>
          <header className="mb-10 flex items-center justify-center gap-5">
            <img
              className="h-[50px] w-[50px]"
              src={communities.data?.[0]?.collections?.[0]?.collection?.image}
            />
            <h1 className="text-xl font-bold uppercase">
              {wildcard} Community
            </h1>
          </header>
          <CommunityGrid communities={communities} viewRef={refCommunity} />
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
          <TokensGrid
            tokenCount={data.collection.tokenCount}
            tokens={tokens}
            viewRef={ref}
          />
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
  if (!hostParts) {
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

  if (nodeEnv === 'production' && hostParts?.length < 3) {
    return {
      notFound: true,
    }
  }

  if (nodeEnv === 'development' && hostParts?.length < 2) {
    return {
      notFound: true,
    }
  }

  // In development: hostParts = ['localhost:3000', 'subdomain1', 'subdomain2']
  // In production: hostParts = ['TLD', 'domain', 'subdomain1', 'subdomain2']
  const wildcard = nodeEnv === 'development' ? hostParts[1] : hostParts[2]

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
