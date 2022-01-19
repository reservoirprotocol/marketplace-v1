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

const apiBase = process.env.NEXT_PUBLIC_API_BASE
const collectionId = process.env.NEXT_PUBLIC_COLLECTION_ID

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

const Home: NextPage<Props> = ({ collection, fallback }) => {
  const { containerRef, isVisible } = useIsVisible()

  const tokenCount = collection?.collection?.set?.tokenCount || 0

  const tokens = useSWRInfinite<
    paths['/tokens']['get']['responses']['200']['schema']
  >((index, previousPageData) => getKey(index, previousPageData), fetcher, {
    // solution only in beta
    // https://github.com/vercel/swr/pull/1538
    revalidateFirstPage: false,
    // revalidateOnMount: false,
    fallbackData: [fallback.tokens],
  })

  // Fetch more data when component is visible
  useEffect(() => {
    if (isVisible) {
      tokens.setSize(tokens.size + 1)
    }
  }, [isVisible])

  return (
    <Layout>
      <Hero collection={collection} />
      <TokensGrid
        tokenCount={tokenCount}
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
  }
  collection: paths['/collections/{collection}']['get']['responses']['200']['schema']
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
    const collection: Props['collection'] = await res1.json()

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
        collection,
        fallback: {
          tokens,
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
