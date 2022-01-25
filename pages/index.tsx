import Layout from 'components/Layout'
import { paths } from 'interfaces/apiTypes'
import setParams from 'lib/params'
import useSWRInfinite, { SWRInfiniteKeyLoader } from 'swr/infinite'
import type {
  GetServerSideProps,
  InferGetStaticPropsType,
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

type Props = InferGetStaticPropsType<typeof getServerSideProps>

const Home: NextPage<Props> = ({ wildcard }) => {
  const { ref, inView } = useInView()
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

  let url = new URL(`/collections/${wildcard}`, apiBase)

  const collection = useSWR<
    paths['/collections/{collection}']['get']['responses']['200']['schema']
  >(url.href, fetcher)

  // Fetch more data when component is visible
  useEffect(() => {
    if (inView) {
      tokens.setSize(tokens.size + 1)
    }
  }, [inView])

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

  return (
    <Layout
      title={collection.data?.collection?.collection?.name}
      image={collection.data?.collection?.collection?.image}
    >
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
    </Layout>
  )
}

export default Home

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
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

  return { props: { wildcard } }
}
