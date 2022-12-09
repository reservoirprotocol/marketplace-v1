import type {
  GetStaticPaths,
  GetStaticProps,
  InferGetStaticPropsType,
  NextPage,
} from 'next'
import { useRouter } from 'next/router'
import Layout from 'components/Layout'
import { useRef, useState } from 'react'
import useCollectionStats from 'hooks/useCollectionStats'
import useTokens from 'hooks/useTokens'
import { setToast } from 'components/token/setToast'
import { paths, setParams } from '@reservoir0x/reservoir-kit-client'
import Hero from 'components/Hero'
import { formatNumber } from 'lib/numbers'
import Sidebar from 'components/Sidebar'
import AttributesFlex from 'components/AttributesFlex'
import TokensGrid from 'components/TokensGrid'
import Head from 'next/head'
import FormatNativeCrypto from 'components/FormatNativeCrypto'
import * as Tabs from '@radix-ui/react-tabs'
import { toggleOnItem } from 'lib/router'
import Sweep from 'components/Sweep'
import { useCollections } from '@reservoir0x/reservoir-kit-ui'
import CollectionActivityTab from 'components/tables/CollectionActivityTab'
import RefreshButton from 'components/RefreshButton'
import SortTokens from 'components/SortTokens'
import MobileTokensFilter from 'components/filter/MobileTokensFilter'

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

type Props = InferGetStaticPropsType<typeof getStaticProps>

const Home: NextPage<Props> = ({ fallback, id }) => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const scrollToTop = () => {
    let top = (scrollRef.current?.offsetTop || 0) - 91 //Offset from parent element minus height of navbar
    window.scrollTo({ top: top })
  }

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
    false
  )

  const attributes = fallback?.attributes?.attributes

  if (!CHAIN_ID) return null

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
          className="flex w-screen flex-col"
        >
          <Tabs.List className="flex justify-center border-b border-[#D4D4D4] dark:border-[#525252]">
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
            <div ref={scrollRef} className="relative flex flex-row">
              <Sidebar
                attributes={attributes}
                refreshData={() => {
                  tokens.setSize(1)
                }}
                scrollToTop={scrollToTop}
              />
              <div className="mx-6 mt-4 w-full">
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
                    <SortTokens />
                    <Sweep
                      collection={collection}
                      tokens={tokens.data}
                      setToast={setToast}
                      mutate={tokens.mutate}
                    />
                  </div>
                </div>
                <div className="z-20 mb-10 flex items-center justify-between">
                  <div>
                    <AttributesFlex className="flex flex-wrap gap-3" />
                  </div>
                </div>
                <TokensGrid
                  tokens={tokens}
                  viewRef={refTokens}
                  collectionImage={collection?.image as string}
                  collectionSize={stats.data?.stats?.tokenCount}
                  collectionAttributes={attributes}
                  isLoading={isLoading}
                />
              </div>
              <MobileTokensFilter
                attributes={attributes}
                refreshData={() => {
                  tokens.setSize(1)
                }}
                scrollToTop={scrollToTop}
              />
            </div>
          </Tabs.Content>
          <Tabs.Content
            value="activity"
            className="mx-[25px] max-w-[1500px] pt-2 md:mx-auto md:w-full"
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
    attributes: paths['/collections/{collection}/attributes/all/v2']['get']['responses']['200']['schema']
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
    includeDynamicPricing: true,
  }

  setParams(tokensUrl, tokensQuery)

  const tokensRes = await fetch(tokensUrl.href, options)

  const tokens = (await tokensRes.json()) as Props['fallback']['tokens']

  // ATTRIBUTES
  const attributesUrl = new URL(
    `${RESERVOIR_API_BASE}/collections/${id}/attributes/all/v2`
  )

  const attributesRes = await fetch(attributesUrl.href, options)

  const attributes =
    (await attributesRes.json()) as Props['fallback']['attributes']

  return {
    props: { fallback: { collection, tokens, attributes }, id },
    revalidate: 20,
  }
}
