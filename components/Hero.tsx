import { FC, useEffect, useState, ComponentProps, useRef } from 'react'
import { FiChevronDown, FiMoreVertical, FiRefreshCcw } from 'react-icons/fi'
import { paths } from '@reservoir0x/reservoir-kit-client'
import { BidModal, Trait } from '@reservoir0x/reservoir-kit-ui'
import { useNetwork, useSigner } from 'wagmi'
import Toast from 'components/Toast'
import toast from 'react-hot-toast'
import useCollectionStats from 'hooks/useCollectionStats'
import { useRouter } from 'next/router'
import useTokens from 'hooks/useTokens'
import HeroSocialLinks from 'components/hero/HeroSocialLinks'
import HeroBackground from 'components/hero/HeroBackground'
import HeroStats from 'components/hero/HeroStats'
import Sweep from './Sweep'
import ReactMarkdown from 'react-markdown'
import { useMediaQuery } from '@react-hookz/web'
import { useCollections } from '@reservoir0x/reservoir-kit-ui'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

const PROXY_API_BASE = process.env.NEXT_PUBLIC_PROXY_API_BASE
const envBannerImage = process.env.NEXT_PUBLIC_BANNER_IMAGE
const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID
const ENV_COLLECTION_DESCRIPTIONS =
  process.env.NEXT_PUBLIC_COLLECTION_DESCRIPTIONS

const setToast = (data: ComponentProps<typeof Toast>['data']) => {
  toast.custom((t) => <Toast t={t} toast={toast} data={data} />)
}

type Props = {
  collectionId: string | undefined
  fallback: {
    tokens: paths['/tokens/v5']['get']['responses']['200']['schema']
    collection: paths['/collections/v5']['get']['responses']['200']['schema']
  }
}

const Hero: FC<Props> = ({ fallback, collectionId }) => {
  const { data: signer } = useSigner()
  const collectionResponse = useCollections({
    id: collectionId,
    includeTopBid: true,
  })
  const collection =
    collectionResponse.data && collectionResponse.data[0]
      ? collectionResponse.data[0]
      : undefined
  const router = useRouter()
  const stats = useCollectionStats(router, collectionId)
  const [attribute, setAttribute] = useState<Trait>(undefined)
  const { tokens } = useTokens(collectionId, [fallback.tokens], router, false)
  const [descriptionExpanded, setDescriptionExpanded] = useState(false)
  const descriptionRef = useRef<HTMLParagraphElement | null>(null)
  const isSmallDevice = useMediaQuery('only screen and (max-width : 768px)')
  const { chain: activeChain } = useNetwork()

  const dropdownItemClasses =
    'reservoir-gray-dropdown-item flex gap-2 rounded-none border-b text-black last:border-b-0 dark:border-[#525252] dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800 dark:focus:bg-neutral-800'

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
      setAttribute(undefined)
      return
    }

    const value = router.query[attributesSelected[0]]?.toString()
    const key = attributesSelected[0].slice(11, -1)

    if (key && value) {
      setAttribute({
        // Extract the key from the query key: attributes[{key}]
        key,
        value,
      })
    }
  }, [router.query])

  if (!CHAIN_ID) {
    throw 'A Chain id is required'
  }

  const env = {
    chainId: +CHAIN_ID as ChainId,
  }

  const isInTheWrongNetwork = Boolean(signer && activeChain?.id !== env.chainId)

  const statsObj = {
    count: Number(collection?.tokenCount ?? 0),
    topOffer: collection?.topBid?.price?.amount?.decimal,
    topOfferCurrency: collection?.topBid?.price?.currency,
    topOfferSource: collection?.topBid?.sourceDomain,
    floor: collection?.floorAsk?.price?.amount?.native,
    allTime: collection?.volume?.allTime,
    volumeChange: collection?.volumeChange?.['1day'],
    floorChange: collection?.floorSaleChange?.['1day'],
  }

  const bannerImage = envBannerImage || collection?.banner

  //Split on commas outside of backticks (`)
  let envDescriptions = ENV_COLLECTION_DESCRIPTIONS
    ? ENV_COLLECTION_DESCRIPTIONS.split(/,(?=(?:[^\`]*\`[^\`]*\`)*[^\`]*$)/)
    : null
  let envDescription = null

  if (envDescriptions && envDescriptions.length > 0) {
    envDescriptions.find((description) => {
      const descriptionPieces = description.split('::')
      if (descriptionPieces[0] == collectionId) {
        envDescription = descriptionPieces[1].replace(/`/g, '')
      }
    })
  }

  const description =
    envDescription || (collection?.description as string | undefined)
  const header = {
    banner: bannerImage as string,
    image: collection?.image as string,
    name: collection?.name,
    description: description,
    shortDescription: description ? description.slice(0, 150) : description,
  }

  const isSupported = !!collection?.collectionBidSupported

  const isAttributeModal = !!attribute

  let isLongDescription = false
  let descriptionHeight = '60px'

  if (descriptionRef.current) {
    isLongDescription = descriptionRef.current.clientHeight > 60
    descriptionHeight = descriptionExpanded
      ? `${descriptionRef.current.clientHeight}px`
      : '60px'
  }

  const refreshCollection = async function (collectionId: string | undefined) {
    function handleError(message?: string) {
      setToast({
        kind: 'error',
        message: message || 'Request to refresh collection was rejected.',
        title: 'Refresh collection failed',
      })
    }

    try {
      if (!collectionId) throw new Error('No collection ID')

      const data = {
        collection: collectionId,
      }

      const pathname = `${PROXY_API_BASE}/collections/refresh/v1`

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
  }

  return (
    <>
      <HeroBackground banner={header.banner}>
        <div className="z-10 flex w-full flex-col items-center gap-6">
          <img
            className={`h-20 w-20 rounded-full ${
              header.image ? 'visible' : 'hidden'
            }`}
            alt={`${header.name} Logo`}
            src={header.image}
          />
          <h1 className="reservoir-h4 text-center text-black dark:text-white">
            {header.name}
          </h1>
          <HeroSocialLinks
            collection={collection}
            refreshCollection={refreshCollection}
          />
          <HeroStats stats={statsObj} />
          {header.description && (
            <>
              <div
                className="relative overflow-hidden transition-[max-height] ease-in-out md:w-[423px]"
                style={{ maxHeight: descriptionHeight }}
              >
                <p
                  ref={descriptionRef}
                  className="text-center text-sm text-[#262626] transition-[width] duration-300 ease-in-out dark:text-white"
                >
                  <ReactMarkdown
                    className="markdown-support"
                    linkTarget="_blank"
                  >
                    {header.description}
                  </ReactMarkdown>
                </p>
              </div>
              {isLongDescription && (
                <a
                  className="mt-[-18px]"
                  onClick={(e) => {
                    e.preventDefault()
                    setDescriptionExpanded(!descriptionExpanded)
                  }}
                >
                  <FiChevronDown
                    className={`h-5 w-5 text-black transition-transform dark:text-white ${
                      descriptionExpanded ? 'rotate-180' : ''
                    }`}
                    aria-hidden
                  />
                </a>
              )}
            </>
          )}
          <div className="flex w-full flex-col justify-center gap-4 md:flex-row">
            {isSupported && (
              <BidModal
                collectionId={collection?.id}
                trigger={
                  <button
                    disabled={isInTheWrongNetwork}
                    className="btn-primary-outline min-w-[222px] whitespace-nowrap border border-[#D4D4D4] bg-white text-black dark:border-[#525252] dark:bg-black dark:text-white dark:ring-[#525252] dark:focus:ring-4"
                  >
                    {isAttributeModal
                      ? 'Make an Attribute Offer'
                      : 'Make a Collection Offer'}
                  </button>
                }
                attribute={attribute}
                onBidComplete={() => {
                  stats.mutate()
                  tokens.mutate()
                }}
                onBidError={(error) => {
                  if (error) {
                    if (
                      (error as any).cause.code &&
                      (error as any).cause.code === 4001
                    ) {
                      setToast({
                        kind: 'error',
                        message: 'You have canceled the transaction.',
                        title: 'User canceled transaction',
                      })
                      return
                    }
                  }
                  setToast({
                    kind: 'error',
                    message: 'The transaction was not completed.',
                    title: 'Could not place bid',
                  })
                }}
              />
            )}
            {!isSmallDevice && (
              <div className="">
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger className="btn-primary-outline rounded-lg border border-[#D4D4D4] bg-white p-2 dark:border-[#525252] dark:bg-black dark:ring-[#525252] dark:focus:ring-4">
                    <FiMoreVertical className="h-6 w-6 dark:text-[#D4D4D4]" />
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content
                    sideOffset={4}
                    align="start"
                    className="min-w-[172px] overflow-hidden rounded-lg border bg-white shadow-md radix-side-bottom:animate-slide-down dark:border-[#525252] dark:bg-neutral-900 md:max-w-[422px]"
                  >
                    <DropdownMenu.Item asChild>
                      <button
                        className={dropdownItemClasses}
                        onClick={() => refreshCollection(collectionId)}
                      >
                        <FiRefreshCcw className="h-4 w-4" />
                        Refresh Metadata
                      </button>
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Root>
              </div>
            )}
            {isSmallDevice && (
              <Sweep
                collection={collection}
                tokens={tokens.data}
                setToast={setToast}
                mutate={tokens.mutate}
              />
            )}
          </div>
        </div>
      </HeroBackground>
    </>
  )
}

export default Hero
