import Layout from 'components/Layout'
import type { GetStaticProps, InferGetStaticPropsType, NextPage } from 'next'
import { paths } from '@reservoir0x/client-sdk/dist/types/api'
import setParams from 'lib/params'
import CollectionsGrid from 'components/CollectionsGrid'
import Head from 'next/head'
import useCollections from 'hooks/useCollections'
import { useEffect } from 'react'
import { useRouter } from 'next/router'

// Environment variables
// For more information about these variables
// refer to the README.md file on this repository
// Reference: https://nextjs.org/docs/basic-features/environment-variables#exposing-environment-variables-to-the-browser
// REQUIRED
const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID
const RESERVOIR_API_BASE = process.env.NEXT_PUBLIC_RESERVOIR_API_BASE

// OPTIONAL
const RESERVOIR_API_KEY = process.env.RESERVOIR_API_KEY

const META_TITLE = process.env.NEXT_PUBLIC_META_TITLE
const META_DESCRIPTION = process.env.NEXT_PUBLIC_META_DESCRIPTION
const TAGLINE = process.env.NEXT_PUBLIC_TAGLINE
const COLLECTION = process.env.NEXT_PUBLIC_COLLECTION

type Props = InferGetStaticPropsType<typeof getStaticProps>

const metadata = {
  title: (title: string) => <title>{title}</title>,
  description: (description: string) => (
    <meta name="description" content={description} />
  ),
  tagline: (tagline: string | undefined) => (
    <>{tagline || 'Discover, buy and sell NFTs'}</>
  ),
}

const Home: NextPage<Props> = ({ fallback }) => {
  const router = useRouter()
  const collections = useCollections(fallback.collections)

  const title = META_TITLE && metadata.title(META_TITLE)
  const description = META_DESCRIPTION && metadata.description(META_DESCRIPTION)
  const tagline = metadata.tagline(TAGLINE)

  useEffect(() => {
    if (COLLECTION) {
      router.push(`/collections/${COLLECTION}`)
    }
  }, [COLLECTION])

  // Return error page if the API base url or the environment's
  // chain ID are missing
  if (!CHAIN_ID) {
    console.debug({ CHAIN_ID })
    return <div>There was an error</div>
  }

  if (COLLECTION) return null

  return (
    <Layout navbar={{}}>
      <Head>
        {title}
        {description}
      </Head>
      <header className="col-span-full mb-12 mt-[66px] px-4 md:mt-40 lg:px-0">
        <h1 className="reservoir-h1 text-center dark:text-white">{tagline}</h1>
      </header>
      <CollectionsGrid collections={collections} />
    </Layout>
  )
}

export default Home

export const getStaticProps: GetStaticProps<{
  fallback: {
    collections: paths['/collections/v2']['get']['responses']['200']['schema']
  }
}> = async () => {
  const options: RequestInit | undefined = {}

  if (RESERVOIR_API_KEY) {
    options.headers = {
      'x-api-key': RESERVOIR_API_KEY,
    }
  }

  const url = new URL('/collections/v2', RESERVOIR_API_BASE)

  let query: paths['/collections/v2']['get']['parameters']['query'] = {
    limit: 20,
    offset: 0,
    sortBy: '7DayVolume',
  }

  const href = setParams(url, query)
  const res = await fetch(href, options)

  const collections = (await res.json()) as Props['fallback']['collections']

  return {
    props: {
      fallback: {
        collections,
      },
    },
  }
}
