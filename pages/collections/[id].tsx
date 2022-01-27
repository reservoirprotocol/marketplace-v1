import Layout from 'components/Layout'
import { paths } from 'interfaces/apiTypes'
import setParams from 'lib/params'
import useSWRInfinite, { SWRInfiniteKeyLoader } from 'swr/infinite'
import type {
  GetStaticPaths,
  GetStaticProps,
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
import { useRouter } from 'next/router'

const apiBase = process.env.NEXT_PUBLIC_API_BASE
const chainId = process.env.NEXT_PUBLIC_CHAIN_ID
const openSeaApiKey = process.env.NEXT_PUBLIC_OPENSEA_API_KEY

const getKey: (
  url: URL,
  collection: string | undefined,
  ...base: Parameters<SWRInfiniteKeyLoader>
) => ReturnType<SWRInfiniteKeyLoader> = (
  url: URL,
  collection: string | undefined,
  index: number,
  previousPageData: paths['/tokens']['get']['responses']['200']['schema']
) => {
  if (!apiBase || !collection) {
    console.debug('Data is missing.', {
      apiBase,
      collection,
    })
    return null
  }

  // Reached the end
  if (previousPageData && previousPageData?.tokens?.length === 0) return null

  let query: paths['/tokens']['get']['parameters']['query'] = {
    limit: 20,
    offset: index * 20,
    collection,
  }

  setParams(url, query)

  return url.href
}

type Props = InferGetStaticPropsType<typeof getStaticProps>

const Home: NextPage<Props> = ({ fallback }) => {
  const { ref, inView } = useInView()
  const [{ data: signer }] = useSigner()
  const [{ data: network }] = useNetwork()
  const router = useRouter()

  const tokensUrl = new URL('/tokens', apiBase)

  const tokens = useSWRInfinite<Props['fallback']['tokens']>(
    (index, previousPageData) =>
      getKey(tokensUrl, router.query?.id?.toString(), index, previousPageData),
    fetcher,
    {
      // solution only in beta
      // https://github.com/vercel/swr/pull/1538
      revalidateFirstPage: false,
      // revalidateOnMount: false,
      fallbackData: [fallback.tokens],
    }
  )

  // Fetch more data when component is visible
  useEffect(() => {
    if (inView) {
      tokens.setSize(tokens.size + 1)
    }
  }, [inView])

  let url = new URL(`/collections/${router.query?.id?.toString()}`, apiBase)

  const collection = useSWR<Props['fallback']['collection']>(
    url.href,
    fetcher,
    {
      fallbackData: fallback.collection,
    }
  )

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

  const isHome = router.asPath.includes('/collections/')

  const layoutData = {
    title: isHome
      ? 'Your Logo Here'
      : collection.data?.collection?.collection?.name,
    image: isHome ? undefined : collection.data?.collection?.collection?.image,
  }

  return (
    <Layout title={layoutData?.title} image={layoutData?.image}>
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

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  }
}

export const getStaticProps: GetStaticProps<{
  fallback: {
    tokens: paths['/tokens']['get']['responses']['200']['schema']
    collection: paths['/collections/{collection}']['get']['responses']['200']['schema']
  }
}> = async ({ params }) => {
  try {
    // -------------- COLLECTION --------------
    const url1 = new URL(`/collections/${params?.id}`, apiBase)

    const res1 = await fetch(url1.href)
    const collection: Props['fallback']['collection'] = await res1.json()

    // -------------- TOKENS --------------
    const url2 = new URL('/tokens', apiBase)

    const query2: paths['/tokens']['get']['parameters']['query'] = {
      collection: params?.id?.toString(),
    }

    setParams(url2, query2)

    const res2 = await fetch(url2.href)
    const tokens: Props['fallback']['tokens'] = await res2.json()

    return {
      props: {
        fallback: {
          collection,
          tokens,
        },
      },
    }
  } catch (err) {
    console.error(err)
  }
  return {
    notFound: true,
  }
}
