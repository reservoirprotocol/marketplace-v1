import { formatBN } from 'lib/numbers'
import {
  FC,
  useEffect,
  useContext,
  useState,
  ComponentProps,
  useRef,
} from 'react'
import { FiChevronDown } from 'react-icons/fi'
import * as Dialog from '@radix-ui/react-dialog'
import ModalCard from './modal/ModalCard'
import { CgSpinner } from 'react-icons/cg'
import { Execute, paths } from '@reservoir0x/client-sdk/dist/types'
import { GlobalContext } from 'context/GlobalState'
import { useAccount, useNetwork, useSigner } from 'wagmi'
import AttributeOfferModal from './AttributeOfferModal'
import CollectionOfferModal from 'components/CollectionOfferModal'
import Toast from 'components/Toast'
import toast from 'react-hot-toast'
import { buyTokenBeta, buyToken } from '@reservoir0x/client-sdk/dist/actions'
import useCollectionStats from 'hooks/useCollectionStats'
import useCollection from 'hooks/useCollection'
import { useRouter } from 'next/router'
import useTokens from 'hooks/useTokens'
import HeroSocialLinks from 'components/hero/HeroSocialLinks'
import HeroBackground from 'components/hero/HeroBackground'
import HeroStats from 'components/hero/HeroStats'

const envBannerImage = process.env.NEXT_PUBLIC_BANNER_IMAGE
const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID
const OPENSEA_API_KEY = process.env.NEXT_PUBLIC_OPENSEA_API_KEY
const RESERVOIR_API_BASE = process.env.NEXT_PUBLIC_RESERVOIR_API_BASE
const ENV_COLLECTION_DESCRIPTIONS =
  process.env.NEXT_PUBLIC_COLLECTION_DESCRIPTIONS

const setToast = (data: ComponentProps<typeof Toast>['data']) => {
  toast.custom((t) => <Toast t={t} toast={toast} data={data} />)
}

type Props = {
  collectionId: string | undefined
  fallback: {
    tokens: paths['/tokens/v4']['get']['responses']['200']['schema']
    collection: paths['/collection/v1']['get']['responses']['200']['schema']
  }
}

type CollectionModalProps = ComponentProps<typeof CollectionOfferModal>
type AttibuteModalProps = ComponentProps<typeof AttributeOfferModal>

const Hero: FC<Props> = ({ fallback, collectionId }) => {
  const { data: signer } = useSigner()
  const collection = useCollection(fallback.collection, collectionId)
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

  const floor = collection.data?.collection?.floorAsk

  const statsObj = {
    count: Number(collection.data?.collection?.tokenCount ?? 0),
    topOffer: collection.data?.collection?.topBid?.value,
    floor: floor?.price,
    vol24: collection.data?.collection?.volume?.['1day'],
    volumeChange: collection.data?.collection?.volumeChange?.['1day'],
    floorChange: collection.data?.collection?.floorSaleChange?.['1day'],
  }

  const bannerImage =
    envBannerImage || collection?.data?.collection?.metadata?.bannerImageUrl

  let envDescriptions = ENV_COLLECTION_DESCRIPTIONS
    ? ENV_COLLECTION_DESCRIPTIONS.split(',')
    : null
  let envDescription = null

  if (envDescriptions && envDescriptions.length > 0) {
    envDescriptions.find((description) => {
      const descriptionPieces = description.split('::')
      if (descriptionPieces[0] == collectionId) {
        envDescription = descriptionPieces[1]
      }
    })
  }

  const description =
    envDescription ||
    (collection?.data?.collection?.metadata?.description as string | undefined)
  const header = {
    banner: bannerImage as string,
    image: collection?.data?.collection?.metadata?.imageUrl as string,
    name: collection?.data?.collection?.name,
    description: description,
    shortDescription: description ? description.slice(0, 150) : description,
  }

  const token = {
    id: `${floor?.token?.contract}:${floor?.token?.tokenId}`,
    price: floor?.price,
    asker: floor?.maker,
  }

  const hasTokenSetId = !!collection.data?.collection?.tokenSetId
  const isAttributeModal = !!attribute.key && !!attribute.value

  const royalties: CollectionModalProps['royalties'] = {
    bps: collection.data?.collection?.royalties?.bps,
    recipient: collection.data?.collection?.royalties?.recipient,
  }

  const collectionData: CollectionModalProps['data'] = {
    collection: {
      id: collection?.data?.collection?.id,
      image: '',
      name: collection?.data?.collection?.name,
      tokenCount: stats?.data?.stats?.tokenCount ?? 0,
    },
  }

  const attributeData: AttibuteModalProps['data'] = {
    collection: {
      id: collection.data?.collection?.id,
      image: collection?.data?.collection?.metadata?.imageUrl as string,
      name: collection?.data?.collection?.name,
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
          <HeroSocialLinks collection={collection?.data?.collection} />
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
                  {header.description}
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
                  data={collectionData}
                  env={env}
                  stats={stats}
                  tokens={tokens}
                  setToast={setToast}
                />
              ))}
            <HeroBuyButton
              collectionId={collectionId}
              token={token}
              attributeData={attributeData}
              env={env}
            />
          </div>
        </div>
      </HeroBackground>
    </>
  )
}

export default Hero

type HeroBuyButtonProps = {
  collectionId: string | undefined
  attributeData: AttibuteModalProps['data']
  token: {
    id: string
    asker: string | undefined
    price: number | undefined
  }
  env: CollectionModalProps['env']
}

const HeroBuyButton: FC<HeroBuyButtonProps> = ({
  collectionId,
  token,
  env,
}) => {
  const { data: accountData } = useAccount()
  const { activeChain } = useNetwork()
  const { data: signer } = useSigner()
  const { dispatch } = useContext(GlobalContext)
  const [waitingTx, setWaitingTx] = useState<boolean>(false)
  const [steps, setSteps] = useState<Execute['steps']>()
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const stats = useCollectionStats(router, collectionId)

  const taker = accountData?.address
  const expectedPrice = token.price

  const isInTheWrongNetwork = Boolean(signer && activeChain?.id !== env.chainId)
  const isOwner =
    token?.asker?.toLowerCase() === accountData?.address?.toLowerCase()

  const handleSuccess: Parameters<typeof buyToken>[0]['handleSuccess'] = () =>
    stats?.mutate()

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

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        disabled={token.price === null || waitingTx || isInTheWrongNetwork}
        onClick={() => {
          if (!token.id || !taker || !expectedPrice) {
            dispatch({ type: 'CONNECT_WALLET', payload: true })
            return
          }

          execute(token.id, taker, expectedPrice)
        }}
        className="btn-primary-fill min-w-[222px] dark:ring-primary-900 dark:focus:ring-4"
      >
        {waitingTx ? (
          <CgSpinner className="h-4 w-4 animate-spin" />
        ) : (
          `Buy for ${formatBN(token.price, 4)} ETH`
        )}
      </Dialog.Trigger>
      {steps && (
        <Dialog.Portal>
          <Dialog.Overlay>
            <ModalCard title="Buy token" loading={waitingTx} steps={steps} />
          </Dialog.Overlay>
        </Dialog.Portal>
      )}
    </Dialog.Root>
  )
}
