import Layout from 'components/Layout'
import { paths } from 'interfaces/apiTypes'
import setParams from 'lib/params'
import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from 'next'
import useCollection from 'hooks/useCollection'
import Homepage from 'components/Homepage'
import CommunityLanding from 'components/CommunityLanding'
import TokensMain from 'components/TokensMain'
import { ComponentProps } from 'react'
import { useAccount } from 'wagmi'
import useDataDog from 'hooks/useAnalytics'
import useCollections from 'hooks/useCollections'
import Head from 'next/head'

const apiBase = process.env.NEXT_PUBLIC_API_BASE
const chainId = process.env.NEXT_PUBLIC_CHAIN_ID
const collectionEnv = process.env.NEXT_PUBLIC_COLLECTION
const communityEnv = process.env.NEXT_PUBLIC_COMMUNITY
const openSeaApiKey = process.env.NEXT_PUBLIC_OPENSEA_API_KEY

type Props = InferGetServerSidePropsType<typeof getServerSideProps>

const Home: NextPage<Props> = ({ wildcard, isCommunity, isHome }) => {
  const fallback: ComponentProps<typeof TokensMain>['fallback'] = {
    collection: { collection: undefined },
    tokens: { tokens: undefined },
  }
  const [{ data: accountData }] = useAccount()
  useDataDog(accountData)
  // const collections = useCollections(apiBase)

  // const collection = useCollection(apiBase, fallback.collection, wildcard)

  if (!apiBase || !chainId) {
    console.debug({ apiBase, chainId })
    return <div>There was an error</div>
  }

  return (
    <Layout>
      {isHome ? (
        <Homepage apiBase={apiBase} />
      ) : isCommunity ? (
        <CommunityLanding apiBase={apiBase} wildcard={wildcard} />
      ) : (
        <TokensMain
          collectionId={wildcard}
          apiBase={apiBase}
          chainId={+chainId as ChainId}
          fallback={fallback}
          openSeaApiKey={openSeaApiKey}
        />
      )}
    </Layout>
  )
}

export default Home

export const getServerSideProps: GetServerSideProps<{
  wildcard: string
  isCommunity: boolean
  isHome: boolean
}> = async ({ req }) => {
  if (communityEnv) {
    return {
      props: { wildcard: communityEnv, isCommunity: true, isHome: false },
    }
  }

  if (collectionEnv) {
    return {
      props: { wildcard: collectionEnv, isCommunity: false, isHome: false },
    }
  }

  // ['TLD', 'domain', 'subdomain1', 'subdomain2']
  const hostParts = req.headers.host?.split('.').reverse()

  if (!hostParts) {
    return {
      notFound: true,
    }
  }

  // In development: hostParts = ['localhost:3000', 'subdomain1', 'subdomain2']
  // In production: hostParts = ['TLD', 'domain', 'subdomain1', 'subdomain2']

  // Possible cases
  // ['localhost:3000']
  // ['localhost:3000', 'www']
  // ['market', 'reservoir']
  // ['market', 'reservoir', 'www']
  let wildcard = 'www'

  // For cases: ['localhost:3000', 'www', ...]
  if (hostParts.length > 1 && hostParts[0] === 'localhost:3000')
    wildcard = hostParts[1]

  // For cases: ['market', 'reservoir', 'www', ...]
  if (hostParts.length > 2 && hostParts[0] !== 'localhost:3000')
    wildcard = hostParts[2]

  const isHome: boolean = wildcard === 'www'

  // Check the wildcard corresponds to a community
  const url = new URL('/collections', apiBase)

  const query: paths['/collections']['get']['parameters']['query'] = {
    community: wildcard,
  }

  setParams(url, query)

  let isCommunity: boolean = false

  try {
    const res = await fetch(url.href)
    const collections =
      (await res.json()) as paths['/collections']['get']['responses']['200']['schema']
    if (collections.collections) {
      isCommunity = collections.collections.length > 0
    }
  } catch (err) {
    console.log(err)
  }

  return { props: { wildcard, isCommunity, isHome } }
}
