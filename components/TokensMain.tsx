import useAttributes from 'hooks/useAttributes'
import useCollection from 'hooks/useCollection'
import useCollectionAttributes from 'hooks/useCollectionAttributes'
import useCollectionStats from 'hooks/useCollectionStats'
import useFiltersApplied from 'hooks/useFiltersApplied'
import useGetOpenSeaMetadata from 'hooks/useGetOpenSeaMetadata'
import useTokens from 'hooks/useTokens'
import { paths } from 'interfaces/apiTypes'
import instantBuy from 'lib/buyToken'
import { formatBN } from 'lib/numbers'
import { pollSwr } from 'lib/pollApi'
import { useRouter } from 'next/router'
import React, { ComponentProps, FC, useEffect, useState } from 'react'
import { useAccount, useNetwork, useSigner } from 'wagmi'
import AttributeOfferModal from './AttributeOfferModal'
import AttributesFlex from './AttributesFlex'
import CollectionOfferModal from './CollectionOfferModal'
import ExploreFlex from './ExploreFlex'
import ExploreTokens from './ExploreTokens'
import Hero from './Hero'
import Sidebar from './Sidebar'
import SortMenu from './SortMenu'
import SortMenuExplore from './SortMenuExplore'
import TokensGrid from './TokensGrid'
import ViewMenu from './ViewMenu'

type Props = {
  fallback: {
    tokens: paths['/tokens']['get']['responses']['200']['schema']
    collection: paths['/collections/{collection}']['get']['responses']['200']['schema']
  }
  apiBase: string
  chainId: ChainId
  openSeaApiKey: string | undefined
  collectionId: string
}

const TokensMain: FC<Props> = ({
  fallback,
  apiBase,
  chainId,
  openSeaApiKey,
  collectionId,
}) => {
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

  const stats = useCollectionStats(apiBase, router, collectionId)

  const { tokens, ref: refTokens } = useTokens(
    apiBase,
    collectionId,
    [fallback.tokens],
    router
  )

  const { collectionAttributes, ref: refCollectionAttributes } =
    useCollectionAttributes(apiBase, router, collectionId)

  const collection = useCollection(apiBase, fallback.collection, collectionId)

  const attributes = useAttributes(apiBase, collectionId)

  const filtersApplied = useFiltersApplied(router)

  const { data: openSeaMeta } = useGetOpenSeaMetadata(collectionId || '')

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
    collection.data?.collection?.set?.market?.floorSell?.maker?.toLowerCase() ===
    accountData?.address.toLowerCase()

  const floor = stats?.data?.stats?.market?.floorSell

  const statsObj = {
    vol24: 10,
    count: stats?.data?.stats?.tokenCount ?? 0,
    topOffer: stats?.data?.stats?.market?.topBuy?.value,
    floor: floor?.value,
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
    chainId: +chainId as ChainId,
    openSeaApiKey,
  }

  const isInTheWrongNetwork = signer && network.chain?.id !== env.chainId

  const data: ModalProps['data'] = {
    collection: {
      id: collection?.data?.collection?.collection?.id,
      image: collection?.data?.collection?.collection?.image,
      name: collection?.data?.collection?.collection?.name,
      tokenCount: stats?.data?.stats?.tokenCount ?? 0,
    },
  }

  type AttibuteModalProps = ComponentProps<typeof AttributeOfferModal>

  const attributeData: AttibuteModalProps['data'] = {
    collection: {
      id: collection.data?.collection?.collection?.id,
      image: collection?.data?.collection?.collection?.image,
      name: collection?.data?.collection?.collection?.name,
      tokenCount: stats?.data?.stats?.tokenCount ?? 0,
    },
    attribute,
  }

  const isAttributeModal = !!attribute.key && !!attribute.value

  return (
    <>
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

            try {
              const query: Parameters<typeof instantBuy>[2] = {
                contract,
                tokenId,
                side: 'sell',
                taker: await signer.getAddress(),
              }
              setWaitingTx(true)
              await instantBuy(apiBase, signer, query)
              await pollSwr(collection.data, collection.mutate)
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
                Make an attribute offer
              </button>
            }
            royalties={royalties}
            signer={signer}
            data={attributeData}
            env={env}
            stats={stats}
          />
        ) : (
          <CollectionOfferModal
            trigger={
              <button
                className="btn-neutral-outline border-black py-2"
                disabled={!signer || isInTheWrongNetwork}
              >
                Make a collection offer
              </button>
            }
            royalties={royalties}
            signer={signer}
            data={data}
            env={env}
            collection={collection}
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
    </>
  )
}

export default TokensMain
