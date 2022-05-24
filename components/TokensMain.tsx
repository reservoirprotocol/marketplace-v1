import useAttributes from 'hooks/useAttributes'
import useCollection from 'hooks/useCollection'
import useCollectionAttributes from 'hooks/useCollectionAttributes'
import useCollectionStats from 'hooks/useCollectionStats'
import useTokens from 'hooks/useTokens'
import { paths } from '@reservoir0x/client-sdk/dist/types'
import { formatNumber } from 'lib/numbers'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { ComponentProps, FC, useState } from 'react'
import AttributesFlex from './AttributesFlex'
import ExploreFlex from './ExploreFlex'
import ExploreTokens from './ExploreTokens'
import Hero from './Hero'
import Sidebar from './Sidebar'
import SortMenu from './SortMenu'
import SortMenuExplore from './SortMenuExplore'
import TokensGrid from './TokensGrid'
import ViewMenu from './ViewMenu'
import Toast from './Toast'
import { FiRefreshCcw } from 'react-icons/fi'
import FormatEth from './FormatEth'

const envBannerImage = process.env.NEXT_PUBLIC_BANNER_IMAGE

const PROXY_API_BASE = process.env.NEXT_PUBLIC_PROXY_API_BASE

const metaTitle = process.env.NEXT_PUBLIC_META_TITLE
const metaDescription = process.env.NEXT_PUBLIC_META_DESCRIPTION
const metaImage = process.env.NEXT_PUBLIC_META_OG_IMAGE

type Props = {
  chainId: ChainId
  collectionId: string | undefined
  fallback: {
    tokens: paths['/tokens/v4']['get']['responses']['200']['schema']
    collection: paths['/collection/v2']['get']['responses']['200']['schema']
  }
  openSeaApiKey: string | undefined
  setToast: (data: ComponentProps<typeof Toast>['data']) => any
}

const TokensMain: FC<Props> = ({ collectionId, fallback, setToast }) => {
  const router = useRouter()
  const [refreshLoading, setRefreshLoading] = useState(false)

  const collection = useCollection(fallback.collection, collectionId)

  const stats = useCollectionStats(router, collectionId)

  const { tokens, ref: refTokens } = useTokens(
    collectionId,
    [fallback.tokens],
    router
  )

  const { collectionAttributes, ref: refCollectionAttributes } =
    useCollectionAttributes(router, collectionId)

  const attributes = useAttributes(collectionId)

  if (tokens.error) {
    return <div>There was an error</div>
  }

  const tokenCount = stats?.data?.stats?.tokenCount ?? 0
  const bannerImage = (envBannerImage ||
    collection?.data?.collection?.metadata?.bannerImageUrl) as string

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
      <meta name="twitter:image" content={bannerImage} />
      <meta property="og:image" content={bannerImage} />
    </>
  )

  return (
    <>
      <Head>
        {title}
        {description}
        {image}
      </Head>
      <Hero fallback={fallback} collectionId={collectionId} />
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
                onClick={() => refreshCollection(collectionId)}
              >
                <FiRefreshCcw
                  className={`h-5 w-5 ${
                    refreshLoading ? 'animate-spin-reverse' : ''
                  }`}
                />
              </button>
            </div>
          </div>
          <AttributesFlex className="mb-10 flex flex-wrap gap-3" />
          <ExploreFlex />
          {router.query?.attribute_key || router.query?.attribute_key === '' ? (
            <ExploreTokens
              attributes={collectionAttributes}
              viewRef={refCollectionAttributes}
            />
          ) : (
            <TokensGrid
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
  )
}

export default TokensMain
