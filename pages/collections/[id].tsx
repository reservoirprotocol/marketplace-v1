import { paths } from 'interfaces/apiTypes'
import setParams from 'lib/params'
import type {
  GetStaticPaths,
  GetStaticProps,
  InferGetStaticPropsType,
  NextPage,
} from 'next'
import { useRouter } from 'next/router'
import Layout from 'components/Layout'
import TokensMain from 'components/TokensMain'
import Head from 'next/head'
import { useAccount } from 'wagmi'
import useDataDog from 'hooks/useAnalytics'
import useCollections from 'hooks/useCollections'

const apiBase = process.env.NEXT_PUBLIC_API_BASE
const chainId = process.env.NEXT_PUBLIC_CHAIN_ID
const openSeaApiKey = process.env.NEXT_PUBLIC_OPENSEA_API_KEY

type Props = InferGetStaticPropsType<typeof getStaticProps>

const Home: NextPage<Props> = ({ fallback }) => {
  const router = useRouter()
  const [{ data: accountData }] = useAccount()
  useDataDog(accountData)
  // const collections = useCollections(apiBase)

  if (!apiBase || !chainId) {
    console.debug({ apiBase, chainId })
    return <div>There was an error</div>
  }

  let communityId = ''

  if (typeof window !== 'undefined') {
    communityId = window.location.hostname.split('.')[0]
  }

  return (
    <Layout
      navbar={{
        communityId,
      }}
    >
      <TokensMain
        collectionId={router.query.id?.toString() || ''}
        apiBase={apiBase}
        chainId={+chainId as ChainId}
        fallback={fallback}
        openSeaApiKey={openSeaApiKey}
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
