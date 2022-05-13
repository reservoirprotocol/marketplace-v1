import { formatNumber, formatBN } from 'lib/numbers'
import { optimizeImage } from 'lib/optmizeImage'
import { FC, useEffect, useContext, useState, ComponentProps } from 'react'
import { FiGlobe } from 'react-icons/fi'
import FormatEth from './FormatEth'
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

const envBannerImage = process.env.NEXT_PUBLIC_BANNER_IMAGE
const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID
const OPENSEA_API_KEY = process.env.NEXT_PUBLIC_OPENSEA_API_KEY
const RESERVOIR_API_BASE = process.env.NEXT_PUBLIC_RESERVOIR_API_BASE

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
    count: stats?.data?.stats?.tokenCount ?? 0,
    topOffer: stats?.data?.stats?.market?.topBid?.value,
    floor: floor?.price,
    vol24: collection.data?.collection?.volume?.['1day'],
    volumeChange: collection.data?.collection?.volumeChange?.['1day'],
  }

  const social = {
    twitterUsername: collection.data?.collection?.metadata?.twitterUsername,
    externalUrl: collection.data?.collection?.metadata?.externalUrl,
    discordUrl: collection.data?.collection?.metadata?.discordUrl,
  }

  const bannerImage =
    envBannerImage || collection?.data?.collection?.metadata?.bannerImageUrl

  const header = {
    banner: bannerImage as string,
    image: collection?.data?.collection?.metadata?.imageUrl as string,
    name: collection?.data?.collection?.name,
    description: collection?.data?.collection?.metadata?.description as
      | string
      | undefined,
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

  return (
    <>
      <HeroBackground banner={header.banner}>
        <div className="z-10 flex flex-col items-center gap-6">
          <div className="absolute top-6 right-12 flex gap-4">
            {typeof social.discordUrl === 'string' && (
              <a
                className="reservoir-h6 flex-none"
                target="_blank"
                rel="noopener noreferrer"
                href={social.discordUrl}
              >
                <img
                  src="/icons/Discord.svg"
                  alt="Discord Icon"
                  className="h-6 w-6"
                />
              </a>
            )}
            {typeof social.twitterUsername === 'string' && (
              <a
                className="reservoir-h6 flex-none"
                target="_blank"
                rel="noopener noreferrer"
                href={`https://twitter.com/${social.twitterUsername}`}
              >
                <img
                  src="/icons/Twitter.svg"
                  alt="Twitter Icon"
                  className="h-6 w-6"
                />
              </a>
            )}
            {typeof social.externalUrl === 'string' && (
              <a
                className="reservoir-h6 flex-none text-white"
                target="_blank"
                rel="noopener noreferrer"
                href={social.externalUrl}
              >
                <FiGlobe className="h-6 w-6" />
              </a>
            )}
          </div>
          <img
            className="h-20 w-20 rounded-full"
            alt={`${header.name} Logo`}
            src={header.image}
          />
          <h1 className="reservoir-h4 text-white">{header.name}</h1>
          <HeroStats stats={statsObj} />
          {header.description && (
            <p className="w-[423px] text-center text-sm text-white">
              {header.description}
            </p>
          )}
          <div className="grid w-full gap-4 md:flex">
            <HeroBuyButton
              collectionId={collectionId}
              token={token}
              attributeData={attributeData}
              env={env}
            />
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
          </div>
        </div>
      </HeroBackground>
    </>
  )
}

export default Hero

const HeroBackground: FC<{ banner: string | undefined }> = ({
  banner,
  children,
}) => {
  const bannerImage = optimizeImage(envBannerImage || banner, 1500)
  const baseClasses = `relative flex flex-col items-center col-span-full w-full py-14`

  return bannerImage ? (
    <div
      className={`${baseClasses} bg-cover bg-center`}
      style={{ backgroundImage: `url(${bannerImage})` }}
    >
      {children}
      <div className="absolute inset-0 z-0 backdrop-blur"></div>
    </div>
  ) : (
    <div
      className={`${baseClasses} bg-gradient-to-r from-violet-500 to-fuchsia-500`}
    >
      {children}
    </div>
  )
}

type HeroStatsProps = {
  count: number
  topOffer: number | undefined
  floor: number | undefined
  vol24: number | undefined
  volumeChange: number | undefined
}

const HeroStats: FC<{ stats: HeroStatsProps }> = ({ stats }) => {
  return (
    <div className="grid h-[82px] min-w-[647px] grid-cols-4 items-center gap-2 rounded-lg border-[1px] border-gray-300 bg-white dark:bg-black">
      <Stat name="items">
        <h3 className="reservoir-h6 dark:text-white">{stats.count}</h3>
      </Stat>
      <Stat name="top offer">
        <h3 className="reservoir-h6 dark:text-white">
          <FormatEth amount={stats.topOffer} maximumFractionDigits={4} />
        </h3>
      </Stat>
      <Stat name="floor">
        <h3 className="reservoir-h6 flex justify-center gap-1 dark:text-white">
          <FormatEth amount={stats.floor} maximumFractionDigits={2} />
          <PercentageChange value={stats.volumeChange} />
        </h3>
      </Stat>
      <Stat name="24h">
        <h3 className="reservoir-h6 flex justify-center gap-1 dark:text-white">
          <FormatEth amount={stats.vol24} maximumFractionDigits={2} />
          <PercentageChange value={stats.volumeChange} />
        </h3>
      </Stat>
    </div>
  )
}

const Stat: FC<{ name: string }> = ({ name, children }) => (
  <div className="text-center">
    {children}
    <p className="mt-1 text-[#A3A3A3]">{name}</p>
  </div>
)

const PercentageChange: FC<{ value: number | undefined }> = ({ value }) => {
  if (value === undefined) return null

  const percentage = (value - 1) * 100

  if (value < 1) {
    return <div className="text-[#FF3B3B]">{formatNumber(percentage)}%</div>
  }

  if (value > 1) {
    return <div className="text-[#06C270]">+{formatNumber(percentage)}%</div>
  }

  return <div>0%</div>
}

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
        className="btn-primary-fill w-full dark:ring-primary-900 dark:focus:ring-4"
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
