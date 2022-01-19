import EthAccount from 'components/EthAccount'
import Layout from 'components/Layout'
import UserTokensGrid from 'components/UserTokensGrid'
import { paths } from 'interfaces/apiTypes'
import fetcher from 'lib/fetcher'
import setParams from 'lib/params'
import useIsVisible from 'lib/useIsVisible'
import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next'
import { NextRouter, useRouter } from 'next/router'
import { FC, useEffect } from 'react'
import useSWRInfinite, { SWRInfiniteKeyLoader } from 'swr/infinite'

const apiBase = process.env.NEXT_PUBLIC_API_BASE
const collectionId = process.env.NEXT_PUBLIC_COLLECTION_ID

type InfiniteKeyLoader = (
  router: NextRouter,
  ...base: Parameters<SWRInfiniteKeyLoader>
) => ReturnType<SWRInfiniteKeyLoader>

const getKey: InfiniteKeyLoader = (
  router: NextRouter,
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

  let url = new URL(`/users/${router.query?.address}/tokens`, apiBase)

  let query: paths['/users/{user}/tokens']['get']['parameters']['query'] = {
    limit: 20,
    offset: index * 20,
    collection: collectionId,
  }

  setParams(url, query)

  return url.href
}

type Props = InferGetStaticPropsType<typeof getStaticProps>

const Address: FC<Props> = ({ fallback }) => {
  const router = useRouter()

  const { containerRef, isVisible } = useIsVisible()

  const tokens = useSWRInfinite<
    paths['/users/{user}/tokens']['get']['responses']['200']['schema']
  >(
    (index, previousPageData) => getKey(router, index, previousPageData),
    fetcher,
    {
      revalidateFirstPage: false,
      // revalidateOnMount: false,
      fallbackData: [fallback.tokens],
    }
  )

  // Fetch more data when component is visible
  useEffect(() => {
    if (isVisible) {
      tokens.setSize(tokens.size + 1)
    }
  }, [isVisible])

  return (
    <Layout>
      <div className="flex justify-center items-center mt-4 mb-10">
        <EthAccount address={router.query?.address?.toString()} />
      </div>
      <UserTokensGrid tokens={tokens} viewRef={containerRef} />
    </Layout>
  )
}

export default Address

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  }
}

export const getStaticProps: GetStaticProps<{
  fallback: {
    tokens: paths['/users/{user}/tokens']['get']['responses']['200']['schema']
  }
}> = async ({ params }) => {
  try {
    if (!apiBase) {
      throw 'Environment variable NEXT_PUBLIC_API_BASE is undefined.'
    }
    if (!collectionId) {
      throw 'Environment variable NEXT_PUBLIC_COLLECTION_ID is undefined.'
    }
    if (!params?.address) {
      throw 'The user address is undefined'
    }

    let url = new URL(`/users/${params.address}/tokens`, apiBase)

    let query: paths['/users/{user}/tokens']['get']['parameters']['query'] = {
      collection: collectionId,
    }

    setParams(url, query)

    const res = await fetch(url.href)
    const tokens: Props['fallback']['tokens'] = await res.json()

    return {
      props: {
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
