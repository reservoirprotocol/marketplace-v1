import Layout from 'components/Layout'
import { paths } from 'interfaces/apiTypes'
import setParams from 'lib/params'
import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from 'next'
import useCollection from 'hooks/useCollection'
import Head from 'next/head'
import Homepage from 'components/Homepage'
import CommunityLanding from 'components/CommunityLanding'
import TokensMain from 'components/TokensMain'
import { ComponentProps } from 'react'

const apiBase = process.env.NEXT_PUBLIC_API_BASE
const chainId = process.env.NEXT_PUBLIC_CHAIN_ID
const openSeaApiKey = process.env.NEXT_PUBLIC_OPENSEA_API_KEY

type Props = InferGetServerSidePropsType<typeof getServerSideProps>

const Home: NextPage<Props> = ({ wildcard, isCommunity, isHome }) => {
  const fallback: ComponentProps<typeof TokensMain>['fallback'] = {
    collection: { collection: undefined },
    tokens: { tokens: undefined },
  }

  const collection = useCollection(apiBase, fallback.collection, wildcard)

  const layoutData = {
    title: isHome ? undefined : collection.data?.collection?.collection?.name,
    image: isHome ? undefined : collection.data?.collection?.collection?.image,
  }

  if (!apiBase || !chainId) {
    console.debug({ apiBase, chainId })
    return <div>There was an error</div>
  }

  return (
    <Layout title={layoutData?.title} image={layoutData?.image} isHome={isHome}>
      <Head>
        <title>{collection.data?.collection?.collection?.name || ''}</title>
      </Head>
      {isHome ? (
        <Homepage apiBase={apiBase} />
      ) : isCommunity ? (
        <CommunityLanding apiBase={apiBase} wildcard={wildcard} />
      ) : (
        <TokensMain
          id={wildcard}
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
  const hostParts = req.headers.host?.split('.').reverse()
  // Make sure that the host contains at least one subdomain
  // ['subdomain', 'domain', 'TLD']
  // Reverse the host parts to make sure that the third element always
  // corresponds to the first subdomain
  // ['TLD', 'domain', 'subdomain1', 'subdomain2']
  if (!hostParts || hostParts.length < 2) {
    return {
      notFound: true,
    }
  }

  if (!apiBase) {
    console.debug('There are missing environment variables', {
      apiBase,
    })
    return {
      notFound: true,
    }
  }

  // In development: hostParts = ['localhost:3000', 'subdomain1', 'subdomain2']
  // In production: hostParts = ['TLD', 'domain', 'subdomain1', 'subdomain2']
  const wildcard =
    hostParts[0] === 'localhost:3000' ? hostParts[1] : hostParts[2]

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
  } catch (error) {
    return {
      notFound: true,
    }
  }

  const isHome: boolean = wildcard === 'www'

  return { props: { wildcard, isCommunity, isHome } }
}
