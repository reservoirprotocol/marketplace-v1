import Layout from 'components/Layout'
import { paths } from 'interfaces/apiTypes'
import setParams from 'lib/params'
import useSWRInfinite, { SWRInfiniteKeyLoader } from 'swr/infinite'
import type { GetStaticProps, InferGetStaticPropsType, NextPage } from 'next'
import fetcher from 'lib/fetcher'
import TokensGrid from 'components/TokensGrid'
import { useEffect } from 'react'
import useIsVisible from 'lib/useIsVisible'
import Hero from 'components/Hero'
import useSWR from 'swr'
import { useSigner } from 'wagmi'

const apiBase = process.env.NEXT_PUBLIC_API_BASE
const chainId = process.env.NEXT_PUBLIC_CHAIN_ID
const collectionId = process.env.NEXT_PUBLIC_COLLECTION_ID
const collectionImage = process.env.NEXT_PUBLIC_COLLECTION_IMAGE
const openSeaApiKey = process.env.NEXT_PUBLIC_OPENSEA_API_KEY

const getKey: SWRInfiniteKeyLoader = (
  index: number,
  previousPageData: Props['fallback']['tokens']
) => {
  if (!apiBase) {
    console.debug('Environment variable NEXT_PUBLIC_API_BASE is undefined.')
    return null
  }
  if (!collectionId) {
    console.debug(
      'Environment variable NEXT_PUBLIC_COLLECTION_ID is undefined.'
    )
    return null
  }

  // Reached the end
  if (previousPageData && previousPageData?.tokens?.length === 0) return null

  let url = new URL('/tokens', apiBase)

  let query: paths['/tokens']['get']['parameters']['query'] = {
    limit: 20,
    offset: index * 20,
    collection: collectionId,
  }

  setParams(url, query)

  return url.href
}

type Props = InferGetStaticPropsType<typeof getStaticProps>

const Home: NextPage<Props> = ({ fallback }) => {
  const { containerRef, isVisible } = useIsVisible()
  const [{ data: signer }] = useSigner()

  const tokens = useSWRInfinite<Props['fallback']['tokens']>(
    (index, previousPageData) => getKey(index, previousPageData),
    fetcher,
    {
      // solution only in beta
      // https://github.com/vercel/swr/pull/1538
      revalidateFirstPage: false,
      // revalidateOnMount: false,
      fallbackData: [fallback.tokens],
    }
  )

  let url = new URL(`/collections/${collectionId}`, apiBase)

  const collection = useSWR<Props['fallback']['collection']>(
    url.href,
    fetcher,
    {
      fallbackData: fallback.collection,
    }
  )

  // Fetch more data when component is visible
  useEffect(() => {
    if (isVisible) {
      tokens.setSize(tokens.size + 1)
    }
  }, [isVisible])

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

  const data = {
    // COLLECTION WIDE OFFER
    collection: {
      id: collection?.data?.collection?.collection?.id,
      image: collection?.data?.collection?.collection?.image,
      name: collection?.data?.collection?.collection?.name,
      tokenCount: fallback.collection?.collection?.set?.tokenCount ?? 0,
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
      title={collection.data?.collection?.collection?.name ?? 'HOME'}
      image={collectionImage ?? ''}
    >
      <Hero
        stats={stats}
        header={header}
        signer={signer}
        data={data}
        royalties={royalties}
        env={env}
        mutate={collection.mutate}
      />
      <TokensGrid
        tokenCount={data.collection.tokenCount}
        tokens={tokens}
        viewRef={containerRef}
      />
    </Layout>
  )
}

export default Home

export const getStaticProps: GetStaticProps<{
  fallback: {
    tokens: paths['/tokens']['get']['responses']['200']['schema']
    collection: paths['/collections/{collection}']['get']['responses']['200']['schema']
  }
}> = async () => {
  try {
    if (!apiBase) {
      throw 'Environment variable NEXT_PUBLIC_API_BASE is undefined.'
    }
    if (!collectionId) {
      throw 'Environment variable NEXT_PUBLIC_COLLECTION_ID is undefined.'
    }

    // -------------- COLLECTION --------------
    let url1 = new URL(`/collections/${collectionId}`, apiBase)

    const res1 = await fetch(url1.href)
    const collection: Props['fallback']['collection'] = await res1.json()

    // -------------- TOKENS --------------
    let url2 = new URL('/tokens', apiBase)

    let query2: paths['/tokens']['get']['parameters']['query'] = {
      collection: collectionId,
    }

    setParams(url2, query2)

    const res2 = await fetch(url2.href)
    const tokens: Props['fallback']['tokens'] = await res2.json()

    return {
      props: {
        fallback: {
          tokens,
          collection,
        },
      },
    }
  } catch (error) {
    console.error(error)
    return {
      notFound: true,
    }
  }
}
