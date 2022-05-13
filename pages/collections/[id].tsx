import type {
  GetStaticPaths,
  GetStaticProps,
  InferGetStaticPropsType,
  NextPage,
} from 'next'
import { useRouter } from 'next/router'
import Layout from 'components/Layout'
import { useAccount, useConnect, useNetwork, useSigner } from 'wagmi'
import { ComponentProps, useContext, useEffect, useState } from 'react'
import useCollection from 'hooks/useCollection'
import useCollectionStats from 'hooks/useCollectionStats'
import useTokens from 'hooks/useTokens'
import useCollectionAttributes from 'hooks/useCollectionAttributes'
import useAttributes from 'hooks/useAttributes'
import { setToast } from 'components/token/setToast'
import * as Dialog from '@radix-ui/react-dialog'
import {
  buyToken,
  buyTokenBeta,
  Execute,
  paths,
  setParams,
} from '@reservoir0x/client-sdk'
import AttributeOfferModal from 'components/AttributeOfferModal'
import CollectionOfferModal from 'components/CollectionOfferModal'
import Hero from 'components/Hero'
import { CgSpinner } from 'react-icons/cg'
import ModalCard from 'components/modal/ModalCard'
import { formatBN, formatNumber } from 'lib/numbers'
import Sidebar from 'components/Sidebar'
import AttributesFlex from 'components/AttributesFlex'
import ExploreFlex from 'components/ExploreFlex'
import SortMenuExplore from 'components/SortMenuExplore'
import ViewMenu from 'components/ViewMenu'
import SortMenu from 'components/SortMenu'
import { FiRefreshCcw } from 'react-icons/fi'
import ExploreTokens from 'components/ExploreTokens'
import TokensGrid from 'components/TokensGrid'
import Head from 'next/head'
import { GlobalContext } from 'context/GlobalState'
import FormatEth from 'components/FormatEth'

// Environment variables
// For more information about these variables
// refer to the README.md file on this repository
// Reference: https://nextjs.org/docs/basic-features/environment-variables#exposing-environment-variables-to-the-browser
// REQUIRED
const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID

// OPTIONAL
const RESERVOIR_API_KEY = process.env.RESERVOIR_API_KEY
const OPENSEA_API_KEY = process.env.NEXT_PUBLIC_OPENSEA_API_KEY

const envBannerImage = process.env.NEXT_PUBLIC_BANNER_IMAGE

const RESERVOIR_API_BASE = process.env.NEXT_PUBLIC_RESERVOIR_API_BASE
const PROXY_API_BASE = process.env.NEXT_PUBLIC_PROXY_API_BASE

const metaTitle = process.env.NEXT_PUBLIC_META_TITLE
const metaDescription = process.env.NEXT_PUBLIC_META_DESCRIPTION
const metaImage = process.env.NEXT_PUBLIC_META_OG_IMAGE

const COLLECTION = process.env.NEXT_PUBLIC_COLLECTION
const COMMUNITY = process.env.NEXT_PUBLIC_COMMUNITY

type Props = InferGetStaticPropsType<typeof getStaticProps>

const Home: NextPage<Props> = ({ fallback, id }) => {
  if (!CHAIN_ID) return null
  const { data: accountData } = useAccount()
  const { connect, connectors } = useConnect()
  const { data: signer } = useSigner()
  const { activeChain } = useNetwork()
  const router = useRouter()
  const [waitingTx, setWaitingTx] = useState<boolean>(false)
  const [steps, setSteps] = useState<Execute['steps']>()
  const [open, setOpen] = useState(false)
  const { dispatch } = useContext(GlobalContext)
  const [refreshLoading, setRefreshLoading] = useState(false)
  const [attribute, setAttribute] = useState<
    AttibuteModalProps['data']['attribute']
  >({
    key: undefined,
    value: undefined,
  })

  const collection = useCollection(fallback.collection, id)

  const stats = useCollectionStats(router, id)

  const { tokens, ref: refTokens } = useTokens(id, [fallback.tokens], router)

  const { collectionAttributes, ref: refCollectionAttributes } =
    useCollectionAttributes(router, id)

  const attributes = useAttributes(id)

  useEffect(() => {
    const keys = Object.keys(router.query)
    const attributesSelected = keys.filter(
      (key) =>
        key.startsWith('attributes[') &&
        key.endsWith(']') &&
        router.query[key] !== ''
    )

    // Only enable the attribute modal if one attribute is selected
    if (attributesSelected.length !== 1) {
      setAttribute({
        // Extract the key from the query key: attributes[{key}]
        key: undefined,
        value: undefined,
      })
      return
    }

    setAttribute({
      // Extract the key from the query key: attributes[{key}]
      key: attributesSelected[0].slice(11, -1),
      value: router.query[attributesSelected[0]]?.toString(),
    })
  }, [router.query])

  if (tokens.error) {
    return <div>There was an error</div>
  }

  type ModalProps = ComponentProps<typeof CollectionOfferModal>

  const isOwner =
    collection.data?.collection?.floorAsk?.maker?.toLowerCase() ===
    accountData?.address?.toLowerCase()

  const floor = collection.data?.collection?.floorAsk
  const tokenCount = collection.data?.collection?.tokenCount
  const volume = collection.data?.collection?.volume?.['1day']

  const statsObj = {
    count: stats?.data?.stats?.tokenCount ?? 0,
    topOffer: stats?.data?.stats?.market?.topBid?.value,
    floor: floor?.price,
    vol24: collection.data?.collection?.volume?.['1day'],
    volumeChange: collection.data?.collection?.volumeChange?.['1day'],
  }

  const bannerImage =
    envBannerImage || collection?.data?.collection?.metadata?.bannerImageUrl

  const header = {
    banner: bannerImage as string,
    image: collection?.data?.collection?.metadata?.imageUrl as string,
    name: collection?.data?.collection?.name,
  }

  const royalties: ModalProps['royalties'] = {
    bps: collection.data?.collection?.royalties?.bps,
    recipient: collection.data?.collection?.royalties?.recipient,
  }

  const env: ModalProps['env'] = {
    chainId: +CHAIN_ID as ChainId,
    openSeaApiKey: OPENSEA_API_KEY,
  }

  const isInTheWrongNetwork = Boolean(signer && activeChain?.id !== env.chainId)

  const data: ModalProps['data'] = {
    collection: {
      id: collection?.data?.collection?.id,
      // image: collection?.data?.collection?.collection?.image,
      image: '',
      name: collection?.data?.collection?.name,
      tokenCount: stats?.data?.stats?.tokenCount ?? 0,
    },
  }

  type AttibuteModalProps = ComponentProps<typeof AttributeOfferModal>

  const attributeData: AttibuteModalProps['data'] = {
    collection: {
      id: collection.data?.collection?.id,
      image: collection?.data?.collection?.metadata?.imageUrl as string,
      name: collection?.data?.collection?.name,
      tokenCount: stats?.data?.stats?.tokenCount ?? 0,
    },
    attribute,
  }

  const isAttributeModal = !!attribute.key && !!attribute.value

  const hasTokenSetId = !!collection.data?.collection?.tokenSetId

  const handleError: Parameters<typeof buyToken>[0]['handleError'] = (err) => {
    if (err?.type === 'price mismatch') {
      setToast({
        kind: 'error',
        message: 'Price was greater than expected.',
        title: 'Could not buy token',
      })
      return
    }
    if (err?.message === 'Not enough ETH balance') {
      setToast({
        kind: 'error',
        message: 'You have insufficient funds to buy this token.',
        title: 'Not enough ETH balance',
      })
      return
    }
    // Handle user rejection
    if (err?.code === 4001) {
      setOpen(false)
      setSteps(undefined)
      setToast({
        kind: 'error',
        message: 'You have canceled the transaction.',
        title: 'User canceled transaction',
      })
      return
    }
    setToast({
      kind: 'error',
      message: 'The transaction was not completed.',
      title: 'Could not buy token',
    })
  }

  const handleSuccess: Parameters<typeof buyToken>[0]['handleSuccess'] = () =>
    stats?.mutate()

  const execute = async (
    token: string,
    taker: string,
    expectedPrice: number
  ) => {
    if (isOwner) {
      setToast({
        kind: 'error',
        message: 'You already own this token.',
        title: 'Failed to buy token',
      })
      return
    }

    setWaitingTx(true)

    await buyTokenBeta({
      expectedPrice,
      query: { token, taker },
      signer,
      apiBase: RESERVOIR_API_BASE,
      setState: setSteps,
      handleSuccess,
      handleError,
    })

    setWaitingTx(false)
  }

  async function refreshCollection(collectionId: string | undefined) {
    function handleError(message?: string) {
      setToast({
        kind: 'error',
        message: message || 'Request to refresh collection was rejected.',
        title: 'Refresh collection failed',
      })

      setRefreshLoading(false)
    }

    try {
      if (!collectionId) throw new Error('No collection ID')

      const data = {
        collection: collectionId,
      }

      const pathname = `${PROXY_API_BASE}/collections/refresh/v1`

      setRefreshLoading(true)

      const res = await fetch(pathname, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const json = await res.json()
        handleError(json?.message)
        return
      }

      setToast({
        kind: 'success',
        message: 'Request to refresh collection was accepted.',
        title: 'Refresh collection',
      })
    } catch (err) {
      handleError()
      console.error(err)
      return
    }

    setRefreshLoading(false)
  }

  const title = metaTitle ? (
    <title>{metaTitle}</title>
  ) : (
    <title>{collection.data?.collection?.name} | Reservoir Market</title>
  )
  const description = metaDescription ? (
    <meta name="description" content={metaDescription} />
  ) : (
    <meta
      name="description"
      content={collection.data?.collection?.metadata?.description as string}
    />
  )
  const image = metaImage ? (
    <>
      <meta name="twitter:image" content={metaImage} />
      <meta name="og:image" content={metaImage} />
    </>
  ) : (
    <>
      <meta name="twitter:image" content={header.banner} />
      <meta property="og:image" content={header.banner} />
    </>
  )

  const token = `${floor?.token?.contract}:${floor?.token?.tokenId}`
  const taker = accountData?.address

  const social = {
    twitterUsername: collection.data?.collection?.metadata?.twitterUsername,
    externalUrl: collection.data?.collection?.metadata?.externalUrl,
    discordUrl: collection.data?.collection?.metadata?.discordUrl,
  }

  const expectedPrice = statsObj.floor

  return (
    <Layout navbar={{}}>
      <>
        <Head>
          {title}
          {description}
          {image}
        </Head>
        <Hero social={social} stats={statsObj} header={header}>
          <div className="grid w-full gap-4 md:flex">
            <Dialog.Root open={open} onOpenChange={setOpen}>
              <Dialog.Trigger
                disabled={
                  floor?.price === null || waitingTx || isInTheWrongNetwork
                }
                onClick={() => {
                  if (!token || !taker || !expectedPrice) {
                    dispatch({ type: 'CONNECT_WALLET', payload: true })
                    return
                  }

                  execute(token, taker, expectedPrice)
                }}
                className="btn-primary-fill w-full dark:ring-primary-900 dark:focus:ring-4"
              >
                {waitingTx ? (
                  <CgSpinner className="h-4 w-4 animate-spin" />
                ) : (
                  `Buy for ${formatBN(floor?.price, 4)} ETH`
                )}
              </Dialog.Trigger>
              {steps && (
                <Dialog.Portal>
                  <Dialog.Overlay>
                    <ModalCard
                      title="Buy token"
                      loading={waitingTx}
                      steps={steps}
                    />
                  </Dialog.Overlay>
                </Dialog.Portal>
              )}
            </Dialog.Root>
            {hasTokenSetId &&
              (isAttributeModal ? (
                <AttributeOfferModal
                  royalties={royalties}
                  signer={signer}
                  data={attributeData}
                  env={env}
                  stats={stats}
                  tokens={tokens}
                  setToast={setToast}
                />
              ) : (
                <CollectionOfferModal
                  royalties={royalties}
                  signer={signer}
                  data={data}
                  env={env}
                  stats={stats}
                  tokens={tokens}
                  setToast={setToast}
                />
              ))}
          </div>
        </Hero>
        <div className="col-span-full grid grid-cols-4 gap-x-4 md:grid-cols-8 lg:grid-cols-12 3xl:grid-cols-16 4xl:grid-cols-21">
          <hr className="col-span-full border-gray-300 dark:border-neutral-600" />
          <Sidebar attributes={attributes} setTokensSize={tokens.setSize} />
          <div className="col-span-full mx-6 mt-4 sm:col-end-[-1] md:col-start-4">
            <div className="mb-10 hidden items-center justify-between md:flex">
              <div className="flex items-center gap-6">
                {!!stats?.data?.stats?.tokenCount &&
                  stats?.data?.stats?.tokenCount > 0 && (
                    <>
                      <div>
                        {formatNumber(stats?.data?.stats?.tokenCount)} items
                      </div>

                      <div className="h-9 w-px bg-gray-300 dark:bg-neutral-600"></div>
                      <div>
                        <FormatEth
                          maximumFractionDigits={4}
                          amount={stats?.data?.stats?.market?.floorAsk?.price}
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
                    <SortMenuExplore setSize={collectionAttributes.setSize} />
                    <ViewMenu />
                  </>
                ) : (
                  <SortMenu setSize={tokens.setSize} />
                )}
                <button
                  className="btn-primary-outline dark:border-neutral-600 dark:text-white dark:ring-primary-900 dark:focus:ring-4"
                  title="Refresh collection"
                  disabled={refreshLoading}
                  onClick={() => refreshCollection(id)}
                >
                  <FiRefreshCcw
                    className={`h-5 w-5 ${
                      refreshLoading ? 'animate-spin-reverse' : ''
                    }`}
                  />
                </button>
              </div>
            </div>
            <AttributesFlex />
            <ExploreFlex />
            {router.query?.attribute_key ||
            router.query?.attribute_key === '' ? (
              <ExploreTokens
                attributes={collectionAttributes}
                viewRef={refCollectionAttributes}
              />
            ) : (
              <TokensGrid
                tokenCount={statsObj.count}
                tokens={tokens}
                viewRef={refTokens}
                collectionImage={
                  collection.data?.collection?.metadata?.imageUrl as string
                }
              />
            )}
          </div>
        </div>
      </>
    </Layout>
  )
}

export default Home

export const getStaticPaths: GetStaticPaths = async () => {
  if (COLLECTION && !COMMUNITY) {
    return {
      paths: [{ params: { id: COLLECTION } }],
      fallback: false,
    }
  }

  if (COLLECTION && COMMUNITY) {
    const url = new URL(
      `${PROXY_API_BASE}/search/collections/v1`,
      RESERVOIR_API_BASE
    )

    const query: paths['/search/collections/v1']['get']['parameters']['query'] =
      { community: COMMUNITY, limit: 20 }

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

    console.log(paths)

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
    collection: paths['/collection/v1']['get']['responses']['200']['schema']
    tokens: paths['/tokens/v4']['get']['responses']['200']['schema']
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
  const collectionUrl = new URL('/collection/v1', RESERVOIR_API_BASE)

  let collectionQuery: paths['/collection/v1']['get']['parameters']['query'] = {
    id,
  }

  setParams(collectionUrl, collectionQuery)

  const collectionRes = await fetch(collectionUrl.href, options)

  const collection =
    (await collectionRes.json()) as Props['fallback']['collection']

  // TOKENS
  const tokensUrl = new URL('/tokens/v4', RESERVOIR_API_BASE)

  let tokensQuery: paths['/tokens/v4']['get']['parameters']['query'] = {
    collection: id,
    sortBy: 'floorAskPrice',
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
