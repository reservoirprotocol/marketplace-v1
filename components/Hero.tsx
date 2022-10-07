import { FC, useEffect, useState, ComponentProps, useRef } from 'react'
import { FiChevronDown } from 'react-icons/fi'
import { paths } from '@reservoir0x/reservoir-kit-client'
<<<<<<< HEAD
import { BidModal } from '@reservoir0x/reservoir-kit-ui'
import { useContractRead, useNetwork, useProvider, useSigner } from 'wagmi'
=======
import { useSigner } from 'wagmi'
>>>>>>> parent of 0d992e1... Replace existing bid modal with RK bid modal (#492)
import AttributeOfferModal from './AttributeOfferModal'
import CollectionOfferModal from 'components/CollectionOfferModal'
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
import { Result } from 'ethers/lib/utils'

const envBannerImage = process.env.NEXT_PUBLIC_BANNER_IMAGE
const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID
const OPENSEA_API_KEY = process.env.NEXT_PUBLIC_OPENSEA_API_KEY
const ENV_COLLECTION_DESCRIPTIONS =
  process.env.NEXT_PUBLIC_COLLECTION_DESCRIPTIONS

const setToast = (data: ComponentProps<typeof Toast>['data']) => {
  toast.custom((t) => <Toast t={t} toast={toast} data={data} />)
}

type IMintMode = 'Allowlist' | 'Open' | 'Closed'
const mintStatus = (mintingOpen: Result | boolean, allowlistOnlyMode: Result | boolean): IMintMode => {
  if (mintingOpen && allowlistOnlyMode) return 'Allowlist'
  if (mintingOpen && !allowlistOnlyMode) return 'Open'
  return 'Closed'
}

type Props = {
  collectionId: string | undefined
  fallback: {
    tokens: paths['/tokens/v5']['get']['responses']['200']['schema']
    collection: paths['/collections/v5']['get']['responses']['200']['schema']
  }
}

type CollectionModalProps = ComponentProps<typeof CollectionOfferModal>
type AttibuteModalProps = ComponentProps<typeof AttributeOfferModal>

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
  const [attribute, setAttribute] = useState<
    AttibuteModalProps['data']['attribute']
  >({
    key: undefined,
    value: undefined,
  })

  const { tokens } = useTokens(collectionId, [fallback.tokens], router)
  const [descriptionExpanded, setDescriptionExpanded] = useState(false)
  const descriptionRef = useRef<HTMLParagraphElement | null>(null)
  const isSmallDevice = useMediaQuery('only screen and (max-width : 750px)')
<<<<<<< HEAD
  const { chain: activeChain } = useNetwork()
  const { data: totalSupply } = useContractRead({
    addressOrName: collection?.primaryContract || '',
    contractInterface: [{
      "inputs": [],
      "name": "collectionSize",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },],
    functionName: 'collectionSize',
    chainId: activeChain?.id || 1,
  }) || null
  const { data: mintingOpen } = useContractRead({
    addressOrName: collection?.primaryContract || '',
    contractInterface: [{
      "inputs": [],
      "name": "mintingOpen",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }],
    functionName: 'mintingOpen',
    chainId: activeChain?.id || 1,
  })
  const { data: onlyAllowlistMode } = useContractRead({
    addressOrName: collection?.primaryContract || '',
    contractInterface: [{
      "inputs": [],
      "name": "onlyAllowlistMode",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }],
    functionName: 'onlyAllowlistMode',
    chainId: activeChain?.id || 1,
  })
=======
>>>>>>> parent of 0d992e1... Replace existing bid modal with RK bid modal (#492)

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

  if (!CHAIN_ID) {
    throw 'A Chain id is required'
  }

  const env: CollectionModalProps['env'] = {
    chainId: +CHAIN_ID as ChainId,
    openSeaApiKey: OPENSEA_API_KEY,
  }

  const statsObj = {
    count: Number(collection?.tokenCount ?? 0),
    topOffer: collection?.topBid?.price?.amount?.native,
    floor: collection?.floorAsk?.price?.amount?.native,
    allTime: collection?.volume?.allTime,
    volumeChange: collection?.volumeChange?.['1day'],
    floorChange: collection?.floorSaleChange?.['1day'],
    maxSupply: totalSupply?.toString() || null,
    mintMode: typeof (mintingOpen) === 'boolean' ? mintStatus(mintingOpen, onlyAllowlistMode ?? false) : null
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

  const isSupported =
    !!collection?.tokenSetId && !!collection?.collectionBidSupported

  const isAttributeModal = !!attribute.key && !!attribute.value

  const royalties: CollectionModalProps['royalties'] = {
    bps: collection?.royalties?.bps,
    recipient: collection?.royalties?.recipient,
  }

  const collectionData: CollectionModalProps['data'] = {
    collection: {
      id: collection?.id,
      image: '',
      name: collection?.name,
      tokenCount: stats?.data?.stats?.tokenCount ?? 0,
    },
  }

  const attributeData: AttibuteModalProps['data'] = {
    collection: {
      id: collection?.id,
      image: collection?.image as string,
      name: collection?.name,
      tokenCount: stats?.data?.stats?.tokenCount ?? 0,
    },
    attribute,
  }

  let isLongDescription = false
  let descriptionHeight = '60px'

  if (descriptionRef.current) {
    isLongDescription = descriptionRef.current.clientHeight > 60
    descriptionHeight = descriptionExpanded
      ? `${descriptionRef.current.clientHeight}px`
      : '60px'
  }

  return (
    <>
      <HeroBackground banner={header.banner}>
        <div className="z-10 flex w-full flex-col items-center gap-6">
          <img
            className="h-20 w-20 rounded-full"
            alt={`${header.name} Logo`}
            src={header.image}
          />
          <h1 className="reservoir-h4 text-center text-black dark:text-white">
            {header.name}
          </h1>
          <HeroSocialLinks collection={collection} />
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
                  <ReactMarkdown linkTarget="_blank">
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
                    className={`h-5 w-5 text-black transition-transform dark:text-white ${descriptionExpanded ? 'rotate-180' : ''
                      }`}
                    aria-hidden
                  />
                </a>
              )}
            </>
          )}
          <div className="flex w-full flex-col justify-center gap-4 md:flex-row">
            {isSupported &&
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
                  data={collectionData}
                  env={env}
                  stats={stats}
                  tokens={tokens}
                  setToast={setToast}
                />
              ))}
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
