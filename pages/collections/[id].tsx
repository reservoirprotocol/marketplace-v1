import setParams from 'lib/params'
import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from 'next'
import { useRouter } from 'next/router'
import Layout from 'components/Layout'
import TokensMain from 'components/TokensMain'
import { useAccount } from 'wagmi'
import useDataDog from 'hooks/useAnalytics'
import Toast from 'components/Toast'
import toast from 'react-hot-toast'
import { paths } from '@reservoir0x/client-sdk'
import getMode from 'lib/getMode'

// Environment variables
// For more information about these variables
// refer to the README.md file on this repository
// Reference: https://nextjs.org/docs/basic-features/environment-variables#exposing-environment-variables-to-the-browser
// REQUIRED
const RESERVOIR_API_BASE = process.env.NEXT_PUBLIC_RESERVOIR_API_BASE
const RESERVOIR_API_KEY = process.env.RESERVOIR_API_KEY
const chainId = process.env.NEXT_PUBLIC_CHAIN_ID

// OPTIONAL
const openSeaApiKey = process.env.NEXT_PUBLIC_OPENSEA_API_KEY
const COLLECTION = process.env.NEXT_PUBLIC_COLLECTION
const COMMUNITY = process.env.NEXT_PUBLIC_COMMUNITY
const USE_WILDCARD = process.env.NEXT_PUBLIC_USE_WILDCARD

type Props = InferGetServerSidePropsType<typeof getServerSideProps>

const Home: NextPage<Props> = ({ fallback, mode, collectionId }) => {
  const router = useRouter()
  const [{ data: accountData }] = useAccount()
  useDataDog(accountData)

  if (!chainId) {
    console.debug({ chainId })
    return <div>There was an error</div>
  }

  let communityId = ''

  if (typeof window !== 'undefined') {
    communityId = window.location.hostname.split('.')[0]
  }

  return (
    <Layout
      navbar={{
        communityId: collectionId,
        mode,
      }}
    >
      <TokensMain
        collectionId={router.query.id?.toString()}
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

export const getServerSideProps: GetServerSideProps<{
  fallback: {
    tokens: paths['/tokens/v2']['get']['responses']['200']['schema']
    collection: paths['/collection/v1']['get']['responses']['200']['schema']
  }
  mode: ReturnType<typeof getMode>['mode']
  collectionId?: string
}> = async ({ req, params }) => {
  if (!RESERVOIR_API_KEY) {
    throw 'Missing RESERVOIR_API_KEY'
  }

  const options: RequestInit | undefined = {
    headers: {
      'x-api-key': RESERVOIR_API_KEY,
    },
  }

  const { mode, collectionId } = getMode(
    req,
    USE_WILDCARD,
    COMMUNITY,
    COLLECTION
  )

  try {
    // Pass in fallback data to prevent loading screens
    // Reference: https://swr.vercel.app/docs/options
    // -------------- COLLECTION --------------
    const url1 = new URL('/collection/v1', RESERVOIR_API_BASE)

    let query: paths['/collection/v1']['get']['parameters']['query'] = {
      id: params?.id?.toString(),
    }

    const href = setParams(url1, query)

    const res1 = await fetch(href, options)
    const collection: Props['fallback']['collection'] = await res1.json()

    // -------------- TOKENS --------------
    const url2 = new URL('/tokens/v2', RESERVOIR_API_BASE)

    const query2: paths['/tokens/v2']['get']['parameters']['query'] = {
      collection: collection.collection?.id,
    }

    const href2 = setParams(url2, query2)

    const res2 = await fetch(href2, options)
    const tokens: Props['fallback']['tokens'] = await res2.json()

    return {
      props: {
        mode,
        collectionId,
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
