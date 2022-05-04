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
import getMode from 'lib/getMode'

// Environment variables
// For more information about these variables
// refer to the README.md file on this repository
// Reference: https://nextjs.org/docs/basic-features/environment-variables#exposing-environment-variables-to-the-browser
// REQUIRED
const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID

// OPTIONAL
const RESERVOIR_API_KEY = process.env.RESERVOIR_API_KEY
const OPENSEA_API_KEY = process.env.NEXT_PUBLIC_OPENSEA_API_KEY
const COLLECTION = process.env.NEXT_PUBLIC_COLLECTION
const COMMUNITY = process.env.NEXT_PUBLIC_COMMUNITY
const USE_WILDCARD = process.env.NEXT_PUBLIC_USE_WILDCARD

type Props = InferGetServerSidePropsType<typeof getServerSideProps>

const Home: NextPage<Props> = ({ mode, collectionId }) => {
  const router = useRouter()
  const { data: accountData } = useAccount()
  useDataDog(accountData)

  if (!CHAIN_ID) {
    console.debug({ CHAIN_ID })
    return <div>There was an error</div>
  }

  let communityId = ''

  if (typeof window !== 'undefined') {
    communityId = window.location.hostname.split('.')[0]
  }

  const fallback = {
    tokens: {},
    collection: {},
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
        chainId={+CHAIN_ID as ChainId}
        fallback={fallback}
        openSeaApiKey={OPENSEA_API_KEY}
        setToast={(data) =>
          toast.custom((t) => <Toast t={t} toast={toast} data={data} />)
        }
      />
    </Layout>
  )
}

export default Home

export const getServerSideProps: GetServerSideProps<{
  mode: ReturnType<typeof getMode>['mode']
  collectionId?: string
}> = async ({ req }) => {
  const options: RequestInit | undefined = {}

  if (RESERVOIR_API_KEY) {
    options.headers = {
      'x-api-key': RESERVOIR_API_KEY,
    }
  }

  const { mode, collectionId } = getMode(
    req,
    USE_WILDCARD,
    COMMUNITY,
    COLLECTION
  )

  return {
    props: {
      mode,
      collectionId,
    },
  }
}
