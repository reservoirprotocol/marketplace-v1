import { ComponentProps, FC, useContext, useEffect, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import ExpirationSelector from './ExpirationSelector'
import { constants, ethers } from 'ethers'
import {
  useAccount,
  useBalance,
  useNetwork,
  useProvider,
  useSigner,
} from 'wagmi'
import calculateOffer from 'lib/calculateOffer'
import FormatEth from './FormatEth'
import expirationPresets from 'lib/offerExpirationPresets'
import getWeth from 'lib/getWeth'
import useCollectionStats from 'hooks/useCollectionStats'
import useTokens from 'hooks/useTokens'
import {
  Execute,
  ReservoirClientActions,
} from '@reservoir0x/reservoir-kit-client'
import ModalCard from './modal/ModalCard'
import Toast from './Toast'
import { CgSpinner } from 'react-icons/cg'
import { GlobalContext } from 'context/GlobalState'
import { useReservoirClient } from '@reservoir0x/reservoir-kit-ui'

const SOURCE_DOMAIN = process.env.NEXT_PUBLIC_SOURCE_DOMAIN
const SOURCE_ID = process.env.NEXT_PUBLIC_SOURCE_ID
const SOURCE_NAME = process.env.NEXT_PUBLIC_SOURCE_NAME

const FEE_BPS = process.env.NEXT_PUBLIC_FEE_BPS
const FEE_RECIPIENT = process.env.NEXT_PUBLIC_FEE_RECIPIENT

const ARTBLOCKS = '0xa7d8d9ef8d8ce8992df33d8b8cf4aebabd5bd270'
const ARTBLOCKS2 = '0x059edd72cd353df5106d2b9cc5ab83a52287ac3a'

type Props = {
  env: {
    chainId: ChainId
    openSeaApiKey: string | undefined
  }
  data: {
    collection: {
      image: string | undefined
      name: string | undefined
      id: string | undefined
      tokenCount: number
    }
  }
  royalties: {
    bps: number | undefined
    recipient: string | undefined
  }
  signer: ReturnType<typeof useSigner>['data']
  stats: ReturnType<typeof useCollectionStats>
  tokens: ReturnType<typeof useTokens>['tokens']
  setToast: (data: ComponentProps<typeof Toast>['data']) => any
}

const CollectionOfferModal: FC<Props> = ({
  env,
  royalties,
  stats,
  data,
  tokens,
  setToast,
}) => {
  const [expiration, setExpiration] = useState<string>('oneDay')
  const [waitingTx, setWaitingTx] = useState<boolean>(false)
  const [steps, setSteps] = useState<Execute['steps']>()
  const { chain: activeChain } = useNetwork()
  const [open, setOpen] = useState(false)
  const { dispatch } = useContext(GlobalContext)
  const [calculations, setCalculations] = useState<
    ReturnType<typeof calculateOffer>
  >({
    fee: constants.Zero,
    total: constants.Zero,
    missingEth: constants.Zero,
    missingWeth: constants.Zero,
    error: null,
    warning: null,
  })
  const [offerPrice, setOfferPrice] = useState<string>('')
  const [weth, setWeth] = useState<Awaited<ReturnType<typeof getWeth>>>(null)
  const { data: signer } = useSigner()
  const account = useAccount()
  const { data: ethBalance, refetch } = useBalance({
    addressOrName: account?.address,
  })
  const provider = useProvider()
  const reservoirClient = useReservoirClient()

  function getBps(royalties: number | undefined, envBps: string | undefined) {
    let sum = 0
    if (royalties) sum += royalties
    if (envBps) sum += +envBps
    return sum
  }
  const bps = getBps(royalties.bps, FEE_BPS)
  const royaltyPercentage = royalties?.bps
    ? `${(royalties?.bps / 10000) * 100}%`
    : '0%'

  const isInTheWrongNetwork = Boolean(signer && activeChain?.id !== env.chainId)

  useEffect(() => {
    async function loadWeth() {
      if (signer) {
        await refetch()
        const weth = await getWeth(env.chainId as ChainId, provider, signer)
        if (weth) {
          setWeth(weth)
        }
      }
    }
    loadWeth()
  }, [signer])

  useEffect(() => {
    const userInput = ethers.utils.parseEther(
      offerPrice === '' ? '0' : offerPrice
    )
    if (weth?.balance && ethBalance?.value) {
      const calculations = calculateOffer(
        userInput,
        ethBalance.value,
        weth.balance,
        bps
      )
      setCalculations(calculations)
    }
  }, [offerPrice])

  const handleError = (err: any) => {
    setWaitingTx(false)
    setOpen(false)
    setSteps(undefined)
    // Handle user rejection
    if (err?.code === 4001) {
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
      title: 'Could not place bid',
    })
  }

  const handleSuccess = () => {
    setWaitingTx(false)
    stats.mutate()
    tokens.mutate()
  }

  const execute = async () => {
    if (!signer) {
      dispatch({ type: 'CONNECT_WALLET', payload: true })
      return
    }

    if (!reservoirClient) {
      throw 'reservoirClient not initialized'
    }

    setWaitingTx(true)

    const expirationValue = expirationPresets
      .find(({ preset }) => preset === expiration)
      ?.value()

    const bid: Parameters<ReservoirClientActions['placeBid']>['0']['bids'][0] =
      {
        collection: data.collection.id,
        weiPrice: calculations.total.toString(),
        expirationTime: expirationValue,
        orderbook: 'reservoir',
      }

    if (
      !data.collection.id?.toLowerCase().includes(ARTBLOCKS.toLowerCase()) &&
      !data.collection.id?.toLowerCase().includes(ARTBLOCKS2.toLowerCase())
    ) {
      bid.orderKind = 'seaport'
    } else {
      bid.orderKind = 'zeroex-v4'
    }

    if (FEE_BPS) bid.fee = FEE_BPS
    if (FEE_RECIPIENT) bid.feeRecipient = FEE_RECIPIENT

    await reservoirClient.actions
      .placeBid({
        bids: [bid],
        signer,
        onProgress: setSteps,
      })
      .then(handleSuccess)
      .catch(handleError)
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        disabled={isInTheWrongNetwork}
        className="btn-primary-outline min-w-[222px] whitespace-nowrap border border-[#D4D4D4] bg-white text-black dark:border-[#525252] dark:bg-black dark:text-white dark:ring-[#525252] dark:focus:ring-4"
      >
        Make a Collection Offer
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay>
          <ModalCard
            loading={waitingTx}
            title="Make a Collection Offer"
            onCloseCallback={() => setSteps(undefined)}
            steps={steps}
            actionButton={
              <button
                disabled={
                  +offerPrice <= 0 ||
                  !calculations.missingEth.isZero() ||
                  waitingTx
                }
                onClick={() => {
                  if (!signer) {
                    dispatch({ type: 'CONNECT_WALLET', payload: true })
                    return
                  }
                  execute()
                }}
                className="btn-primary-fill w-full  dark:border-neutral-600 dark:ring-primary-900 dark:focus:ring-4"
              >
                {waitingTx ? (
                  <CgSpinner className="h-4 w-4 animate-spin" />
                ) : (
                  'Make Offer'
                )}
              </button>
            }
          >
            <div className="mb-8 space-y-5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="price"
                  className="reservoir-h6 font-headings dark:text-white"
                >
                  Price (wETH)
                </label>
                <input
                  placeholder="Amount"
                  id="price"
                  type="number"
                  min={0}
                  step={0.01}
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                  className="input-primary-outline w-[140px] dark:border-neutral-600 dark:bg-neutral-900 dark:ring-primary-900 dark:focus:ring-4"
                />
              </div>
              <div className="flex items-center justify-between">
                <ExpirationSelector
                  presets={expirationPresets}
                  setExpiration={setExpiration}
                  expiration={expiration}
                />
              </div>
              <div className="flex justify-between">
                <div className="reservoir-h6 font-headings dark:text-white">
                  Fees
                </div>
                <div className="reservoir-body text-right dark:text-white">
                  <div>Royalty {royaltyPercentage}</div>
                  {FEE_BPS && (
                    <div>
                      {SOURCE_NAME ||
                        SOURCE_ID ||
                        SOURCE_DOMAIN ||
                        'Marketplace'}{' '}
                      {(+FEE_BPS / 10000) * 100}%
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-between">
                <div className="reservoir-h6 font-headings dark:text-white">
                  Total Cost
                </div>
                <div className="reservoir-h6 font-headings dark:text-white">
                  <FormatEth amount={calculations.total} logoWidth={10} />
                </div>
              </div>
              {calculations.error && (
                <div className="rounded-md bg-red-100 px-2 py-1 text-red-900">
                  {calculations.error}
                </div>
              )}
              {calculations.warning && (
                <div className="rounded-md bg-yellow-100 px-2 py-1 text-yellow-900">
                  {calculations.warning}
                </div>
              )}
            </div>
          </ModalCard>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default CollectionOfferModal
