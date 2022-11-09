import type {
  GetStaticPaths,
  GetStaticProps,
  InferGetStaticPropsType,
  NextPage,
} from 'next'
import { useRouter } from 'next/router'
import Layout from 'components/Layout'
import { useState } from 'react'
import useCollectionStats from 'hooks/useCollectionStats'
import useTokens from 'hooks/useTokens'
import useCollectionAttributes from 'hooks/useCollectionAttributes'
import { setToast } from 'components/token/setToast'
import { paths, setParams } from '@reservoir0x/reservoir-kit-client'
import Hero from 'components/Hero'
import { formatNumber } from 'lib/numbers'
import Sidebar from 'components/Sidebar'
import AttributesFlex from 'components/AttributesFlex'
import ExploreFlex from 'components/ExploreFlex'
import SortMenuExplore from 'components/SortMenuExplore'
import ViewMenu from 'components/ViewMenu'
import ExploreTokens from 'components/ExploreTokens'
import TokensGrid from 'components/TokensGrid'
import Head from 'next/head'
import FormatNativeCrypto from 'components/FormatNativeCrypto'
import * as Tabs from '@radix-ui/react-tabs'
import { toggleOnItem } from 'lib/router'
import Sweep from 'components/Sweep'
import { useCollections, useAttributes } from '@reservoir0x/reservoir-kit-ui'
import CollectionActivityTab from 'components/tables/CollectionActivityTab'
import RefreshButton from 'components/RefreshButton'

// Environment variables
// For more information about these variables
// refer to the README.md file on this repository
// Reference: https://nextjs.org/docs/basic-features/environment-variables#exposing-environment-variables-to-the-browser
// REQUIRED
const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID

// OPTIONAL
const RESERVOIR_API_KEY = process.env.NEXT_PUBLIC_RESERVOIR_API_KEY

const envBannerImage = process.env.NEXT_PUBLIC_BANNER_IMAGE

const RESERVOIR_API_BASE = process.env.NEXT_PUBLIC_RESERVOIR_API_BASE
const PROXY_API_BASE = process.env.NEXT_PUBLIC_PROXY_API_BASE

const metaTitle = process.env.NEXT_PUBLIC_META_TITLE
const metaDescription = process.env.NEXT_PUBLIC_META_DESCRIPTION
const metaImage = process.env.NEXT_PUBLIC_META_OG_IMAGE

const COLLECTION = process.env.NEXT_PUBLIC_COLLECTION
const COMMUNITY = process.env.NEXT_PUBLIC_COMMUNITY
const COLLECTION_SET_ID = process.env.NEXT_PUBLIC_COLLECTION_SET_ID
const SOURCE_ID = process.env.NEXT_PUBLIC_SOURCE_ID
const SOURCE_DOMAIN = process.env.NEXT_PUBLIC_SOURCE_DOMAIN

type Props = InferGetStaticPropsType<typeof getStaticProps>

const Home: NextPage<Props> = ({ fallback, id }) => {
  const router = useRouter()
  const [localListings, setLocalListings] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const collectionResponse = useCollections(
    { id },
    {
      fallback: fallback.collection,
    }
  )
  const collection =
    collectionResponse.data && collectionResponse.data[0]
      ? collectionResponse.data[0]
      : undefined

  const stats = useCollectionStats(router, id)

  const { tokens, ref: refTokens } = useTokens(
    id,
    [fallback.tokens],
    router,
    false,
    localListings
  )

  const { collectionAttributes, ref: refCollectionAttributes } =
    useCollectionAttributes(router, id)

  const attributes = useAttributes(id)

  if (!CHAIN_ID) return null

  if (tokens.error) {
    return <div>There was an error</div>
  }

  const tokenCount = stats?.data?.stats?.tokenCount ?? 0

  const title = metaTitle ? (
    <title>{metaTitle}</title>
  ) : (
    <title>{collection?.name}</title>
  )
  const description = metaDescription ? (
    <meta name="description" content={metaDescription} />
  ) : (
    <meta name="description" content={collection?.description as string} />
  )

  const bannerImage = (envBannerImage || collection?.banner) as string

  const image = metaImage ? (
    <>
      <meta name="twitter:image" content={metaImage} />
      <meta name="og:image" content={metaImage} />
    </>
  ) : (
    <>
      <meta name="twitter:image" content={bannerImage} />
      <meta property="og:image" content={bannerImage} />
    </>
  )

  const tabs = [
    { name: 'Items', id: 'items' },
    { name: 'Activity', id: 'activity' },
  ]

  return (
    <Layout navbar={{}}>
      <>
        <Head>
          {title}
          {description}
          {image}
        </Head>
        <Hero collectionId={id} fallback={fallback} />
        <Tabs.Root
          value={router.query?.tab?.toString() || 'items'}
          className="col-span-full grid grid-cols-4 gap-x-4 md:grid-cols-8 lg:grid-cols-12 3xl:grid-cols-16 4xl:grid-cols-21"
        >
          <Tabs.List className="col-span-full flex justify-center border-b border-[#D4D4D4] dark:border-[#525252]">
            {tabs.map(({ name, id }) => (
              <Tabs.Trigger
                key={id}
                id={id}
                value={id}
                className={
                  'group reservoir-h6 relative min-w-0 whitespace-nowrap border-b-2 border-transparent py-4 px-8 text-center text-[#525252] hover:text-black focus:z-10 radix-state-active:border-black radix-state-active:text-black dark:text-white dark:radix-state-active:border-white dark:radix-state-active:text-white'
                }
                onClick={() => toggleOnItem(router, 'tab', id)}
              >
                <span>{name}</span>
              </Tabs.Trigger>
            ))}
          </Tabs.List>
          <Tabs.Content value="items" asChild>
            <>
              <Sidebar
                attributes={attributes.data}
                refreshData={() => {
                  tokens.setSize(1)
                }}
              />
              <div className="col-span-full mx-6 mt-4 sm:col-end-[-1] md:col-start-4">
                <div className="mb-4 hidden items-center justify-between md:flex">
                  <div className="flex items-center gap-6 font-semibold">
                    <RefreshButton
                      refreshData={() => {
                        tokens.mutate()
                      }} 
                      isLoading={isLoading}
                      setIsLoading={setIsLoading}
                      />
                    {tokenCount > 0 && (
                      <>
                        <div>{formatNumber(tokenCount)} items</div>

                        <div className="h-9 w-px bg-gray-300 dark:bg-neutral-600"></div>
                        <div className="flex items-center gap-1">
                          <FormatNativeCrypto
                            amount={
                              stats?.data?.stats?.market?.floorAsk?.price
                                ?.amount?.decimal
                            }
                          />{' '}
                          floor price
                        </div>
                      </>
                    )}
                  </div>
                  <div className="flex gap-4">
                    {router.query?.attribute_key ||
                    router.query?.attribute_key === '' ? (
                      <>
                        <SortMenuExplore
                          setSize={collectionAttributes.setSize}
                        />
                        <ViewMenu />
                      </>
                    ) : null}
                    <Sweep
                      collection={collection}
                      tokens={tokens.data}
                      setToast={setToast}
                      mutate={tokens.mutate}
                    />
                  </div>
                </div>
                <div className="mb-10 flex items-center justify-between">
                  <div>
                    <AttributesFlex className="flex flex-wrap gap-3" />
                    <ExploreFlex />
                  </div>
                  {(SOURCE_ID || SOURCE_DOMAIN) && (
                    <div className="flex items-center gap-4">
                      <input
                        type="checkbox"
                        name="localListings"
                        id="localListings"
                        className="scale-125 transform"
                        onChange={(e) => setLocalListings(e.target.checked)}
                      />
                      <label
                        htmlFor="localListings"
                        className="reservoir-body dark:text-white"
                      >
                        Show Only Local Listings
                      </label>
                    </div>
                  )}
                </div>
                {router.query?.attribute_key ||
                router.query?.attribute_key === '' ? (
                  <ExploreTokens
                    attributes={collectionAttributes}
                    viewRef={refCollectionAttributes}
                  />
                ) : (
                  <TokensGrid
                    tokens={tokens}
                    viewRef={refTokens}
                    collectionImage={collection?.image as string}
                    isLoading={isLoading}
                  />
                )}
              </div>
            </>
          </Tabs.Content>
          <Tabs.Content
            value="activity"
            className="col-span-full mx-[25px] grid pt-2 lg:col-start-2 lg:col-end-[-2]"
          >
            <CollectionActivityTab collectionId={id} />
          </Tabs.Content>
        </Tabs.Root>
      </>
    </Layout>
  )
}

export default Home

export const getStaticPaths: GetStaticPaths = async () => {
  if (COLLECTION && !COMMUNITY && !COLLECTION_SET_ID) {
    return {
      paths: [{ params: { id: COLLECTION } }],
      fallback: false,
    }
  }

  if (COLLECTION && (COMMUNITY || COLLECTION_SET_ID)) {
    const url = new URL(`${RESERVOIR_API_BASE}/search/collections/v1`)

    const query: paths['/search/collections/v1']['get']['parameters']['query'] =
      { limit: 20 }

    if (COLLECTION_SET_ID) {
      query.collectionsSetId = COLLECTION_SET_ID
    } else {
      if (COMMUNITY) query.community = COMMUNITY
    }

    setParams(url, query)

    const res = await fetch(url.href)

    const collections =
      (await res.json()) as paths['/search/collections/v1']['get']['responses']['200']['schema']

    if (!collections?.collections) {
      return {
        paths: [{ params: { id: COLLECTION } }],
        fallback: false,
      }
    }

    if (collections.collections?.length === 0) {
      return {
        paths: [{ params: { id: COLLECTION } }],
        fallback: false,
      }
    }

    const paths = collections?.collections?.map(({ contract }) => ({
      params: {
        id: contract,
      },
    }))

    return {
      paths,
      fallback: false,
    }
  }

  return {
    paths: [],
    fallback: 'blocking',
  }
}

export const getStaticProps: GetStaticProps<{
  collectionId?: string
  fallback: {
    collection: paths['/collections/v5']['get']['responses']['200']['schema']
    tokens: paths['/tokens/v5']['get']['responses']['200']['schema']
  }
  id: string | undefined
}> = async ({ params }) => {
  const options: RequestInit | undefined = {}

  if (RESERVOIR_API_KEY) {
    options.headers = {
      'x-api-key': RESERVOIR_API_KEY,
    }
  }

  const id = params?.id?.toString()

  // COLLECTION
  const collectionUrl = new URL(`${RESERVOIR_API_BASE}/collections/v5`)

  let collectionQuery: paths['/collections/v5']['get']['parameters']['query'] =
    {
      id,
      includeTopBid: true,
    }

  setParams(collectionUrl, collectionQuery)

  const collectionRes = await fetch(collectionUrl.href, options)

  const collection =
    (await collectionRes.json()) as Props['fallback']['collection']

  // TOKENS
  const tokensUrl = new URL(`${RESERVOIR_API_BASE}/tokens/v5`)

  let tokensQuery: paths['/tokens/v5']['get']['parameters']['query'] = {
    collection: id,
    sortBy: 'floorAskPrice',
    includeTopBid: false,
    limit: 20,
  }

  setParams(tokensUrl, tokensQuery)

  const tokensRes = await fetch(tokensUrl.href, options)

  const tokens = (await tokensRes.json()) as Props['fallback']['tokens']

  return {
    props: { fallback: { collection, tokens }, id },
    revalidate: 20,
  }
}
