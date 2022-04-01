import Layout from 'components/Layout'
import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from 'next'
import Homepage from 'components/Homepage'
import TokensMain from 'components/TokensMain'
import { ComponentProps } from 'react'
import { useAccount } from 'wagmi'
import useDataDog from 'hooks/useAnalytics'
import getMode from 'lib/getMode'
import toast from 'react-hot-toast'
import Toast from 'components/Toast'
import { paths, setParams } from '@reservoir0x/client-sdk'

// Environment variables
// For more information about these variables
// refer to the README.md file on this repository
// Reference: https://nextjs.org/docs/basic-features/environment-variables#exposing-environment-variables-to-the-browser
// REQUIRED
const apiBase = process.env.NEXT_PUBLIC_API_BASE
const chainId = process.env.NEXT_PUBLIC_CHAIN_ID

// OPTIONAL
const collectionEnv = process.env.NEXT_PUBLIC_COLLECTION
const communityEnv = process.env.NEXT_PUBLIC_COMMUNITY
const openSeaApiKey = process.env.NEXT_PUBLIC_OPENSEA_API_KEY
const USE_WILDCARD = process.env.NEXT_PUBLIC_USE_WILDCARD

type Props = InferGetServerSidePropsType<typeof getServerSideProps>

const Home: NextPage<Props> = ({ mode, contractAddress, collectionId }) => {
  const fallback: ComponentProps<typeof TokensMain>['fallback'] = {
    collection: { collection: undefined },
    tokens: { tokens: undefined },
  }
  const [{ data: accountData }] = useAccount()
  useDataDog(accountData)

  // Return error page if the API base url or the environment's
  // chain ID are missing
  if (!apiBase || !chainId) {
    console.debug({ apiBase, chainId })
    return <div>There was an error</div>
  }

  return (
    <Layout navbar={{ mode, communityId: collectionId }}>
      {mode === 'global' ? (
        <Homepage apiBase={apiBase} />
      ) : (
        <TokensMain
          apiBase={apiBase}
          chainId={+chainId as ChainId}
          collectionId={contractAddress}
          fallback={fallback}
          openSeaApiKey={openSeaApiKey}
          setToast={(data) =>
            toast.custom((t) => <Toast t={t} toast={toast} data={data} />)
          }
        />
      )}
    </Layout>
  )
}

export default Home

export const getServerSideProps: GetServerSideProps<{
  mode: ReturnType<typeof getMode>['mode']
  contractAddress?: string
  collectionId?: string
}> = async ({ req }) => {
  if (!USE_WILDCARD) return { props: { mode: 'global' } }

  const { mode, collectionId } = getMode(req, communityEnv, collectionEnv)

  let contractAddress: string | undefined = undefined

  if (mode === 'community') {
    const url = new URL('/collections/v2', apiBase)

    let query: paths['/collections/v2']['get']['parameters']['query'] = {
      limit: 20,
      offset: 0,
      community: collectionId,
      sortBy: '7DayVolume',
    }

    setParams(url, query)

    const res = await fetch(url.href)

    const json =
      (await res.json()) as paths['/collections/v2']['get']['responses']['200']['schema']

    contractAddress = json.collections?.[0].id

    if (!contractAddress) {
      return {
        notFound: true,
      }
    }

    return { props: { mode, collectionId, contractAddress } }
  }

  if (mode === 'collection') {
    const url = new URL('/collection/v1', apiBase)

    const query: paths['/collection/v1']['get']['parameters']['query'] = {
      slug: collectionId,
    }

    setParams(url, query)

    const res = await fetch(url.href)

    const json =
      (await res.json()) as paths['/collection/v1']['get']['responses']['200']['schema']

    contractAddress = json.collection?.id

    if (!contractAddress) {
      return {
        notFound: true,
      }
    }

    return { props: { mode, contractAddress } }
  }

  return { props: { mode } }
}
