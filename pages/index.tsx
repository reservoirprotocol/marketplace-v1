import Layout from 'components/Layout'
import type { GetStaticProps, InferGetStaticPropsType, NextPage } from 'next'
import { paths } from '@reservoir0x/reservoir-sdk'
import setParams from 'lib/params'
import Head from 'next/head'
import TrendingCollectionTable from 'components/TrendingCollectionTable'
import SortTrendingCollections from 'components/SortTrendingCollections'
import Footer from 'components/Footer'
import { useMediaQuery } from '@react-hookz/web'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import HomeContent from 'components/HomeContent'
import Script from 'next/script'

// Environment variables
// For more information about these variables
// refer to the README.md file on this repository
// Reference: https://nextjs.org/docs/basic-features/environment-variables#exposing-environment-variables-to-the-browser
// REQUIRED
const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID
const RESERVOIR_API_BASE = process.env.NEXT_PUBLIC_RESERVOIR_API_BASE

// OPTIONAL
const RESERVOIR_API_KEY = process.env.NEXT_PUBLIC_RESERVOIR_API_KEY
const REDIRECT_HOMEPAGE = process.env.NEXT_PUBLIC_REDIRECT_HOMEPAGE
const META_TITLE = process.env.NEXT_PUBLIC_META_TITLE
const META_DESCRIPTION = process.env.NEXT_PUBLIC_META_DESCRIPTION
const META_IMAGE = process.env.NEXT_PUBLIC_META_OG_IMAGE
const TAGLINE = process.env.NEXT_PUBLIC_TAGLINE
const COLLECTION = process.env.NEXT_PUBLIC_COLLECTION
const COMMUNITY = process.env.NEXT_PUBLIC_COMMUNITY
const COLLECTION_SET_ID = process.env.NEXT_PUBLIC_COLLECTION_SET_ID

type Props = InferGetStaticPropsType<typeof getStaticProps>

const metadata = {
  title: (title: string) => <title>{title}</title>,
  description: (description: string) => (
    <meta name="description" content={description} />
  ),
  tagline: (tagline: string | undefined) => (
    <>{tagline || 'Discover, buy and sell NFTs'}</>
  ),
  image: (image?: string) => {
    if (image) {
      return (
        <>
          <meta name="twitter:image" content={image} />
          <meta name="og:image" content={image} />
        </>
      )
    }
    return null
  },
}

const Home: NextPage<Props> = ({ fallback }) => {
  const isSmallDevice = useMediaQuery('only screen and (max-width : 600px)')
  const router = useRouter()

  const title = META_TITLE && metadata.title(META_TITLE)
  const description = META_DESCRIPTION && metadata.description(META_DESCRIPTION)
  const image = metadata.image(META_IMAGE)
  const tagline = metadata.tagline(TAGLINE)

  useEffect(() => {
    if (REDIRECT_HOMEPAGE && COLLECTION) {
      router.push(`/collections/${COLLECTION}`)
    }
  }, [COLLECTION, REDIRECT_HOMEPAGE])

  // Return error page if the API base url or the environment's
  // chain ID are missing
  if (!CHAIN_ID) {
    console.debug({ CHAIN_ID })
    return <div>There was an error</div>
  }

  if (REDIRECT_HOMEPAGE && COLLECTION) return null

  return (
    <Layout navbar={{}}>
      <Head>
        {title}
        {description}
        {image}
      </Head>
      {/* Google Analytics */}
      {/* <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-TRM105Y3D5"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-TRM105Y3D5', {
            page_path: window.location.pathname,
            send_page_view: false // we're tracking this ourselves
          });
        `}
      </Script> */}
      <div
        style={isSmallDevice ? { marginTop: -64 } : { marginTop: -72 }}
        className="col-span-full lg:px-0 z-[-2] bg-[#F8E6D0]"
      >
        <video loop autoPlay muted playsInline className=" md:hidden object-cover w-[100vw] h-[100vh]">
          <source src='https://cdn.finiliar.com/website/Banner_Mobile_new logo_MP4.compressed (1).mp4' type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <video loop autoPlay muted playsInline className="hidden md:block object-cover w-[100vw] h-[100vh]">
          <source src='https://cdn.finiliar.com/website/banner_hero_new_logo.mp4' type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      <HomeContent />
      <Footer/>
    </Layout>
  )
}

export default Home

// NOTE: we don't really need this function at all, if we delete it will our page
// still be rendered on server side?
export const getStaticProps: GetStaticProps<{
  fallback: {
    collections: paths['/collections/v5']['get']['responses']['200']['schema']
  }
}> = async () => {
  const options: RequestInit | undefined = {}

  if (RESERVOIR_API_KEY) {
    options.headers = {
      'x-api-key': RESERVOIR_API_KEY,
    }
  }

  const url = new URL('/collections/v5', RESERVOIR_API_BASE)

  let query: paths['/collections/v5']['get']['parameters']['query'] = {
    limit: 20,
    sortBy: '1DayVolume',
    normalizeRoyalties: true,
  }

  if (COLLECTION && !COMMUNITY) query.contract = [COLLECTION]
  if (COMMUNITY) query.community = COMMUNITY
  if (COLLECTION_SET_ID) query.collectionsSetId = COLLECTION_SET_ID

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
