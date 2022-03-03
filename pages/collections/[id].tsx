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
import { useAccount } from 'wagmi'
import useDataDog from 'hooks/useAnalytics'
import Toast from 'components/Toast'
import toast from 'react-hot-toast'

// Environment variables
// For more information about these variables
// refer to the README.md file on this repository
// Reference: https://nextjs.org/docs/basic-features/environment-variables#exposing-environment-variables-to-the-browser
// REQUIRED
const apiBase = process.env.NEXT_PUBLIC_API_BASE
const chainId = process.env.NEXT_PUBLIC_CHAIN_ID

// OPTIONAL
const openSeaApiKey = process.env.NEXT_PUBLIC_OPENSEA_API_KEY

type Props = InferGetStaticPropsType<typeof getStaticProps>

const Home: NextPage<Props> = ({ fallback }) => {
  const router = useRouter()
  const [{ data: accountData }] = useAccount()
  useDataDog(accountData)

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
        setToast={(data) =>
          toast.custom((t) => <Toast t={t} toast={toast} data={data} />)
        }
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
    // Pass in fallback data to prevent loading screens
    // Reference: https://swr.vercel.app/docs/options
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
