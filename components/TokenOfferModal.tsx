import { ComponentProps, FC, useEffect, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import ExpirationSelector from './ExpirationSelector'
import { BigNumber, constants, ethers } from 'ethers'
import {
  useBalance,
  useConnect,
  useNetwork,
  useProvider,
  useSigner,
} from 'wagmi'
import calculateOffer from 'lib/calculateOffer'
import { SWRResponse } from 'swr'
import FormatEth from './FormatEth'
import expirationPresets from 'lib/offerExpirationPresets'
import { Common } from '@reservoir0x/sdk'
import getWeth from 'lib/getWeth'
import { Execute, paths, placeBid } from '@reservoir0x/client-sdk'
import ModalCard from './modal/ModalCard'
import Toast from './Toast'
import { getCollection, getDetails } from 'lib/fetch/fetch'
import { CgSpinner } from 'react-icons/cg'
import { checkWallet } from 'lib/wallet'

const RESERVOIR_API_BASE = process.env.NEXT_PUBLIC_RESERVOIR_API_BASE
const ORDER_KIND = process.env.NEXT_PUBLIC_ORDER_KIND
const SOURCE_ID = process.env.NEXT_PUBLIC_SOURCE_ID
const NAVBAR_TITLE = process.env.NEXT_PUBLIC_NAVBAR_TITLE
const FEE_BPS = process.env.NEXT_PUBLIC_FEE_BPS
const FEE_RECIPIENT = process.env.NEXT_PUBLIC_FEE_RECIPIENT

type Details = paths['/tokens/details/v4']['get']['responses']['200']['schema']
type Collection = paths['/collection/v1']['get']['responses']['200']['schema']

type Props = {
  env: {
    chainId: ChainId
    openSeaApiKey: string | undefined
  }
  data:
    | {
        details: SWRResponse<Details, any>
        collection: Collection | undefined
      }
    | {
        collectionId: string | undefined
        contract: string | undefined
        tokenId: string | undefined
      }
  royalties: {
    bps: number | undefined
    recipient: string | undefined
  }
  signer: ethers.Signer | undefined
  setToast: (data: ComponentProps<typeof Toast>['data']) => any
}

const TokenOfferModal: FC<Props> = ({ env, royalties, data, setToast }) => {
  const [expiration, setExpiration] = useState<string>('oneDay')
  const [orderbook, setOrderbook] = useState<('opensea' | 'reservoir')[]>([
    'reservoir',
  ])
  const [postOnOpenSea, setPostOnOpenSea] = useState<boolean>(false)
  const [{ data: connectData }, connect] = useConnect()
  const [waitingTx, setWaitingTx] = useState<boolean>(false)
  const [steps, setSteps] = useState<Execute['steps']>()
  const [{ data: network }] = useNetwork()
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
  const [weth, setWeth] = useState<{
    weth: Common.Helpers.Weth
    balance: BigNumber
  } | null>(null)
  const [{ data: signer }] = useSigner()
  const [{ data: ethBalance }, getBalance] = useBalance()
  const [continute, setContinute] = useState(false)
  const provider = useProvider()
  const bps = royalties?.bps ?? 0
  const royaltyPercentage = `${bps / 100}%`
  const [open, setOpen] = useState(false)
  const isInTheWrongNetwork = signer && network.chain?.id !== env.chainId

  useEffect(() => {
    async function loadWeth() {
      if (signer) {
        await getBalance({ addressOrName: await signer?.getAddress() })
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

  // Data from props
  const [collection, setCollection] = useState<Collection>()
  const [details, setDetails] = useState<SWRResponse<Details, any> | Details>()

  useEffect(() => {
    if (data && open) {
      // Load data if missing
      if ('tokenId' in data) {
        const { contract, tokenId, collectionId } = data

        getDetails(contract, tokenId, setDetails)
        getCollection(collectionId, setCollection)
      }
      // Load data if provided
      if ('details' in data) {
        const { details, collection } = data

        setDetails(details)
        setCollection(collection)
      }
    }
  }, [data, open])

  // Set the token either from SWR or fetch
  let token: NonNullable<Details['tokens']>[0] = { token: undefined }

  // From fetch
  if (details && 'tokens' in details && details.tokens?.[0]) {
    token = details.tokens?.[0]
  }

  // From SWR
  if (details && 'data' in details && details?.data?.tokens?.[0]) {
    token = details.data?.tokens?.[0]
  }

  const modalData = {
    collection: {
      name: collection?.collection?.name,
    },
    token: {
      contract: token?.token?.contract,
      id: token?.token?.tokenId,
      image: token?.token?.image,
      name: token?.token?.name,
      topBuyValue: token?.market?.topBid?.value,
      floorSellValue: token?.market?.floorAsk?.price,
    },
  }

  const handleError: Parameters<typeof placeBid>[0]['handleError'] = (err) => {
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
      title: 'Could not make offer',
    })
  }

  const handleSuccess: Parameters<typeof placeBid>[0]['handleSuccess'] = () => {
    details && 'mutate' in details && details.mutate()
  }

  const execute = async () => {
    await checkWallet(signer, setToast, connect, connectData)

    setWaitingTx(true)

    const expirationValue = expirationPresets
      .find(({ preset }) => preset === expiration)
      ?.value()

    if (!signer) throw 'signer is undefined'

    const query: Parameters<typeof placeBid>['0']['query'] = {
      maker: await signer.getAddress(),
      weiPrice: calculations.total.toString(),
      orderbook: 'reservoir',
      expirationTime: expirationValue,
      token: `${token.token?.contract}:${token.token?.tokenId}`,
    }

    if (!ORDER_KIND) query.orderKind = 'zeroex-v4'

    if (ORDER_KIND) query.orderKind = ORDER_KIND as typeof query.orderKind
    if (NAVBAR_TITLE || SOURCE_ID) query.source = NAVBAR_TITLE || SOURCE_ID
    if (FEE_BPS) query.fee = FEE_BPS
    if (FEE_RECIPIENT) query.feeRecipient = FEE_RECIPIENT

    await placeBid({
      query,
      signer,
      apiBase: RESERVOIR_API_BASE,
      setState: setSteps,
      handleSuccess,
      handleError,
    })

    setWaitingTx(false)
  }

  const onContinue = async () => {
    setWaitingTx(true)

    // setOrderbook((orderbook) => {
    //   orderbook.shift()
    //   return orderbook
    // })

    setOrderbook(['opensea'])

    const expirationValue = expirationPresets
      .find(({ preset }) => preset === expiration)
      ?.value()

    if (!signer) throw 'signer is undefined'

    const query: Parameters<typeof placeBid>['0']['query'] = {
      maker: await signer.getAddress(),
      weiPrice: calculations.total.toString(),
      orderbook: 'opensea',
      expirationTime: expirationValue,
      token: `${token.token?.contract}:${token.token?.tokenId}`,
    }

    if (!ORDER_KIND) query.orderKind = 'zeroex-v4'

    if (ORDER_KIND) query.orderKind = ORDER_KIND as typeof query.orderKind
    if (NAVBAR_TITLE || SOURCE_ID) query.source = NAVBAR_TITLE || SOURCE_ID
    if (FEE_BPS) query.fee = FEE_BPS
    if (FEE_RECIPIENT) query.feeRecipient = FEE_RECIPIENT

    if (postOnOpenSea) {
      await placeBid({
        query,
        signer,
        apiBase: RESERVOIR_API_BASE,
        setState: setSteps,
        handleSuccess,
        handleError,
      })
    }

    setWaitingTx(false)
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        disabled={isInTheWrongNetwork}
        onClick={async () => {
          setPostOnOpenSea(false)
          setOrderbook(['reservoir'])
          await checkWallet(signer, setToast, connect, connectData)
        }}
        className="btn-primary-outline w-full dark:text-white"
      >
        Make Offer
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay>
          <ModalCard
            loading={waitingTx}
            title="Make a Token Offer"
            steps={steps}
            orderbook={orderbook}
            onCloseCallback={() => setSteps(undefined)}
            onContinue={onContinue}
            actionButton={
              <button
                disabled={
                  +offerPrice <= 0 ||
                  !calculations.missingEth.isZero() ||
                  waitingTx
                }
                onClick={execute}
                className="btn-primary-fill w-full"
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
                <label htmlFor="price" className="reservoir-h6">
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
                  className="input-primary-outline w-[160px] dark:bg-neutral-900"
                />
              </div>
              <div className="flex items-center justify-between">
                <ExpirationSelector
                  presets={expirationPresets}
                  setExpiration={setExpiration}
                  expiration={expiration}
                />
              </div>
              <div className="flex items-center gap-3">
                <label htmlFor="postOpenSea" className="reservoir-h6">
                  Post offer to OpenSea
                </label>
                <input
                  type="checkbox"
                  name="postOpenSea"
                  id="postOpenSea"
                  className="scale-125 transform "
                  checked={postOnOpenSea}
                  onChange={(e) => {
                    setPostOnOpenSea(e.target.checked)
                    if (e.target.checked) {
                      setOrderbook(['reservoir', 'opensea'])
                    } else {
                      setOrderbook(['reservoir'])
                    }
                  }}
                />
              </div>
              <div className="flex justify-between">
                <div className="reservoir-h6">Fees</div>
                <div className="reservoir-body text-right">
                  <div>Royalty {royaltyPercentage}</div>
                  {postOnOpenSea && (
                    <div>
                      OpenSea 2.5%<sup>*</sup>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-between">
                <div className="reservoir-h6">Total Cost</div>
                <div className="reservoir-h6">
                  <FormatEth
                    amount={calculations.total}
                    maximumFractionDigits={4}
                    logoWidth={10}
                  />
                </div>
              </div>
              {postOnOpenSea && (
                <div className="reservoir-small">
                  <sup>*</sup>OpenSea fee is taken out of the above amount if
                  item is sold on OpenSea.
                </div>
              )}
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

export default TokenOfferModal
