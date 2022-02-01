import Layout from 'components/Layout'
import { paths } from 'interfaces/apiTypes'
import setParams from 'lib/params'
import type {
  GetStaticPaths,
  GetStaticProps,
  InferGetStaticPropsType,
  NextPage,
} from 'next'
import TokensGrid from 'components/TokensGrid'
import Hero from 'components/Hero'
import { useAccount, useNetwork, useSigner } from 'wagmi'
import { useRouter } from 'next/router'
import Sidebar from 'components/Sidebar'
import useCollectionStats from 'hooks/useCollectionStats'
import useTokens from 'hooks/useTokens'
import useCollectionAttributes from 'hooks/useCollectionAttributes'
import useCollection from 'hooks/useCollection'
import useAttributes from 'hooks/useAttributes'
import ExploreTokens from 'components/ExploreTokens'
import AttributesFlex from 'components/AttributesFlex'
import ExploreFlex from 'components/ExploreFlex'
import useFiltersApplied from 'hooks/useFiltersApplied'
import SortMenuExplore from 'components/SortMenuExplore'
import SortMenu from 'components/SortMenu'
import ViewMenu from 'components/ViewMenu'
import { formatBN } from 'lib/numbers'
import useGetOpenSeaMetadata from 'hooks/useGetOpenSeaMetadata'
import { ComponentProps, useEffect, useState } from 'react'
import { instantBuy } from 'lib/buyToken'
import CollectionOfferModal from 'components/CollectionOfferModal'
import AttributeOfferModal from 'components/AttributeOfferModal'

const apiBase = process.env.NEXT_PUBLIC_API_BASE
const chainId = process.env.NEXT_PUBLIC_CHAIN_ID
const openSeaApiKey = process.env.NEXT_PUBLIC_OPENSEA_API_KEY

type Props = InferGetStaticPropsType<typeof getStaticProps>

const Home: NextPage<Props> = ({ fallback }) => {
  const [{ data: accountData }] = useAccount()
  const [{ data: signer }] = useSigner()
  const [{ data: network }] = useNetwork()
  const router = useRouter()
  const [waitingTx, setWaitingTx] = useState<boolean>(false)
  const [attribute, setAttribute] = useState<
    AttibuteModalProps['data']['attribute']
  >({
    key: undefined,
    value: undefined,
  })

  const stats = useCollectionStats(apiBase, router)

  const { tokens, ref: refTokens } = useTokens(
    apiBase,
    router.query.id?.toString(),
    [fallback.tokens],
    router
  )

  const { collectionAttributes, ref: refCollectionAttributes } =
    useCollectionAttributes(apiBase, router)

  const collection = useCollection(
    apiBase,
    fallback.collection,
    router.query.id?.toString()
  )

  const attributes = useAttributes(apiBase, router.query.id?.toString())

  const filtersApplied = useFiltersApplied(router)

  const { data: openSeaMeta } = useGetOpenSeaMetadata(
    router.query.id?.toString() || ''
  )

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

  if (tokens.error || !apiBase || !chainId || !openSeaApiKey) {
    console.debug({ apiBase, chainId, openSeaApiKey })
    return <div>There was an error</div>
  }

  type ModalProps = ComponentProps<typeof CollectionOfferModal>

  const isOwner =
    collection.data?.collection?.set?.market?.floorSell?.maker?.toLowerCase() ===
    accountData?.address.toLowerCase()

  const floor = collection.data?.collection?.set?.market?.floorSell

  const statsObj = {
    vol24: 10,
    count: stats?.stats?.tokenCount ?? 0,
    topOffer: collection?.data?.collection?.set?.market?.topBuy?.value,
    floor: collection?.data?.collection?.set?.market?.floorSell?.value,
  }

  const header = {
    banner: openSeaMeta?.collection?.banner_image_url,
    image: collection?.data?.collection?.collection?.image,
    name: collection?.data?.collection?.collection?.name,
  }

  const royalties: ModalProps['royalties'] = {
    bps: collection.data?.collection?.royalties?.bps,
    recipient: collection.data?.collection?.royalties?.recipient,
  }

  const env: ModalProps['env'] = {
    apiBase,
    chainId: +chainId,
    openSeaApiKey,
  }

  const isInTheWrongNetwork = signer && network.chain?.id !== env.chainId

  const data: ModalProps['data'] = {
    collection: {
      id: collection?.data?.collection?.collection?.id,
      image: collection?.data?.collection?.collection?.image,
      name: collection?.data?.collection?.collection?.name,
      tokenCount: stats?.stats?.tokenCount ?? 0,
    },
  }

  type AttibuteModalProps = ComponentProps<typeof AttributeOfferModal>

  const attributeData: AttibuteModalProps['data'] = {
    collection: {
      id: collection.data?.collection?.collection?.id,
      image: collection?.data?.collection?.collection?.image,
      name: collection?.data?.collection?.collection?.name,
      tokenCount: stats?.stats?.tokenCount ?? 0,
    },
    attribute,
  }

  const isAttributeModal = !!attribute.key && !!attribute.value

  const isHome = router.asPath.includes('/collections/')

  const layoutData = {
    title: isHome ? undefined : collection.data?.collection?.collection?.name,
    image: isHome ? undefined : collection.data?.collection?.collection?.image,
  }

  return (
    <Layout title={layoutData?.title} image={layoutData?.image}>
      <Hero stats={statsObj} header={header}>
        <button
          disabled={
            !signer ||
            isOwner ||
            floor?.value === null ||
            waitingTx ||
            isInTheWrongNetwork
          }
          onClick={async () => {
            const tokenId = floor?.token?.tokenId
            const contract = floor?.token?.contract

            if (!signer || !tokenId || !contract) {
              console.debug({ tokenId, signer, contract })
              return
            }

            const query: paths['/orders/fill']['get']['parameters']['query'] = {
              contract,
              tokenId,
              side: 'sell',
            }

            try {
              setWaitingTx(true)
              await instantBuy(apiBase, +chainId as 1 | 4, signer, query)
              await collection.mutate()
              setWaitingTx(false)
            } catch (error) {
              setWaitingTx(false)
              console.error(error)
              return
            }
          }}
          className="btn-neutral-fill-dark"
        >
          {waitingTx
            ? 'Waiting...'
            : `Buy for ${formatBN(floor?.value, 4)} ETH`}
        </button>
        {isAttributeModal ? (
          <AttributeOfferModal
            trigger={
              <button
                className="btn-neutral-outline border-black py-2"
                disabled={!signer || isInTheWrongNetwork}
              >
                Make an attribute bid
              </button>
            }
            royalties={royalties}
            signer={signer}
            data={attributeData}
            env={env}
            mutate={collection.mutate}
          />
        ) : (
          <CollectionOfferModal
            trigger={
              <button
                className="btn-neutral-outline border-black py-2"
                disabled={!signer || isInTheWrongNetwork}
              >
                Make a collection bid
              </button>
            }
            royalties={royalties}
            signer={signer}
            data={data}
            env={env}
            mutate={collection.mutate}
          />
        )}
      </Hero>
      <div className="flex gap-5">
        <Sidebar attributes={attributes} setTokensSize={tokens.setSize} />
        <div className="flex-grow">
          <div className="mb-4 hidden items-center justify-between md:flex">
            <div>
              <AttributesFlex />
              <ExploreFlex />
              {!router.query?.attribute_key &&
                router.query?.attribute_key !== '' &&
                !filtersApplied && (
                  <div className="font-medium uppercase opacity-75">
                    All Tokens
                  </div>
                )}
            </div>
            <div className="flex items-center gap-2">
              {router.query?.attribute_key ||
              router.query?.attribute_key === '' ? (
                <>
                  <ViewMenu />
                  <SortMenuExplore setSize={collectionAttributes.setSize} />
                </>
              ) : (
                <SortMenu setSize={tokens.setSize} />
              )}
            </div>
          </div>
          {router.query?.attribute_key || router.query?.attribute_key === '' ? (
            <ExploreTokens
              attributes={collectionAttributes}
              viewRef={refCollectionAttributes}
            />
          ) : (
            <TokensGrid
              tokenCount={statsObj.count}
              tokens={tokens}
              viewRef={refTokens}
            />
          )}
        </div>
      </div>
    </Layout>
  )
}

export default Home

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  }
}

export const getStaticProps: GetStaticProps<{
  fallback: {
    tokens: paths['/tokens']['get']['responses']['200']['schema']
    collection: paths['/collections/{collection}']['get']['responses']['200']['schema']
  }
}> = async ({ params }) => {
  try {
    // -------------- COLLECTION --------------
    const url1 = new URL(`/collections/${params?.id}`, apiBase)

    const res1 = await fetch(url1.href)
    const collection: Props['fallback']['collection'] = await res1.json()

    // -------------- TOKENS --------------
    const url2 = new URL('/tokens', apiBase)

    const query2: paths['/tokens']['get']['parameters']['query'] = {
      collection: params?.id?.toString(),
    }

    setParams(url2, query2)

    const res2 = await fetch(url2.href)
    const tokens: Props['fallback']['tokens'] = await res2.json()

    return {
      props: {
        fallback: {
          collection,
          tokens,
        },
      },
    }
  } catch (err) {
    console.error(err)
  }
  return {
    notFound: true,
  }
}
