import Layout from 'components/Layout'
import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from 'next'
import Homepage from 'components/Homepage'
import CommunityLanding from 'components/CommunityLanding'
import TokensMain from 'components/TokensMain'
import { ComponentProps } from 'react'
import { useAccount } from 'wagmi'
import useDataDog from 'hooks/useAnalytics'
import getMode from 'lib/getMode'

const apiBase = process.env.NEXT_PUBLIC_API_BASE
const chainId = process.env.NEXT_PUBLIC_CHAIN_ID
const collectionEnv = process.env.NEXT_PUBLIC_COLLECTION
const communityEnv = process.env.NEXT_PUBLIC_COMMUNITY
const openSeaApiKey = process.env.NEXT_PUBLIC_OPENSEA_API_KEY

type Props = InferGetServerSidePropsType<typeof getServerSideProps>

const Home: NextPage<Props> = ({ mode, collectionId }) => {
  const fallback: ComponentProps<typeof TokensMain>['fallback'] = {
    collection: { collection: undefined },
    tokens: { tokens: undefined },
  }
  const [{ data: accountData }] = useAccount()
  useDataDog(accountData)

  if (!apiBase || !chainId) {
    console.debug({ apiBase, chainId })
    return <div>There was an error</div>
  }

  return (
    <Layout>
      {mode === 'global' ? (
        <Homepage apiBase={apiBase} />
      ) : mode === 'community' ? (
        <CommunityLanding
          apiBase={apiBase}
          collectionId={collectionId}
          mode={mode}
        />
      ) : (
        <TokensMain
          collectionId={collectionId}
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
  collectionId: string
  mode: string
}> = async ({ req }) => {
  const { mode, collectionId } = getMode(req, communityEnv, collectionEnv)

  return { props: { mode, collectionId } }
}
