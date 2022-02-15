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
import getWildcard from 'lib/getWildcard'
import getIsCommunity from 'lib/getIsCommunity'

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

  // Handle wildcard
  const wildcard = getWildcard(req)
  const isHome = wildcard === 'www'
  const isCommunity = getIsCommunity(wildcard)

  return { props: { wildcard, isCommunity, isHome } }
}
