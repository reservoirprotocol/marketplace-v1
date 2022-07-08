import { ComponentProps, FC, useContext, useEffect, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import ExpirationSelector from './ExpirationSelector'
import { DateTime } from 'luxon'
import { BigNumber, constants, ethers } from 'ethers'
import { useSigner } from 'wagmi'
import FormatEth from './FormatEth'
import { SWRResponse } from 'swr'
import ModalCard from './modal/ModalCard'
import Toast from './Toast'
import { SWRInfiniteResponse } from 'swr/infinite/dist/infinite'
import { getCollection, getDetails } from 'lib/fetch/fetch'
import { CgSpinner } from 'react-icons/cg'
import {
  Execute,
  paths,
  ReservoirSDK,
  ReservoirSDKActions,
} from '@reservoir0x/client-sdk'
import { GlobalContext } from 'context/GlobalState'

const ORDER_KIND = process.env.NEXT_PUBLIC_ORDER_KIND
const SOURCE_ID = process.env.NEXT_PUBLIC_SOURCE_ID
const FEE_BPS = process.env.NEXT_PUBLIC_FEE_BPS
const FEE_RECIPIENT = process.env.NEXT_PUBLIC_FEE_RECIPIENT
const OPENSEA_CROSS_POST = process.env.NEXT_PUBLIC_OPENSEA_CROSS_POST

type Details = paths['/tokens/details/v4']['get']['responses']['200']['schema']
type Collection = paths['/collection/v2']['get']['responses']['200']['schema']

type Props = {
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
  isInTheWrongNetwork: boolean | undefined
  maker: string | undefined
  mutate?: SWRResponse['mutate'] | SWRInfiniteResponse['mutate']
  setToast: (data: ComponentProps<typeof Toast>['data']) => any
  signer: ReturnType<typeof useSigner>['data']
}

const ListModal: FC<Props> = ({
  data,
  maker,
  isInTheWrongNetwork,
  signer,
  children,
  mutate,
  setToast,
}) => {
  // User input
  const [expiration, setExpiration] = useState('oneWeek')
  const [postOnOpenSea, setPostOnOpenSea] = useState<boolean>(false)
  const [listingPrice, setListingPrice] = useState('')
  const [youGet, setYouGet] = useState(constants.Zero)
  const [orderbook, setOrderbook] = useState<('opensea' | 'reservoir')[]>([
    'reservoir',
  ])

  useEffect(() => {
    const userInput = ethers.utils.parseEther(
      listingPrice === '' ? '0' : listingPrice
    )

    let fee = userInput.mul(BigNumber.from(bps)).div(BigNumber.from('10000'))
    let total = userInput.sub(fee)
    setYouGet(total)
  }, [listingPrice])

  // Modal
  const [steps, setSteps] = useState<Execute['steps']>()
  const [waitingTx, setWaitingTx] = useState<boolean>(false)

  // Data from props
  const [collection, setCollection] = useState<Collection>()
  const [details, setDetails] = useState<SWRResponse<Details, any> | Details>()

  const { dispatch } = useContext(GlobalContext)

  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (data) {
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
  }, [data])

  let apiBps = 0

  if ('details' in data) {
    apiBps = data?.collection?.collection?.royalties?.bps || 0
  }
  if ('tokenId' in data) {
    apiBps = collection?.collection?.royalties?.bps || 0
  }

  const royaltyPercentage = `${(apiBps / 10000) * 100}%`

  function getBps(royalties: number | undefined, envBps: string | undefined) {
    let sum = 0
    if (royalties) sum += royalties
    if (envBps) sum += +envBps
    return sum
  }
  const bps = getBps(apiBps, FEE_BPS)

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

  const { token: token_ } = token

  const handleSuccess = () => {
    details && 'mutate' in details && details.mutate()
    mutate && mutate()
  }

  const handleError = (err: any) => {
    // Close modal
    setOpen(false)
    // Reset steps
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
      title: 'Could not list token',
    })
  }

  const execute = async () => {
    setWaitingTx(true)

    const expirationValue = expirationPresets
      .find(({ preset }) => preset === expiration)
      ?.value()

    if (!signer) throw 'signer is undefined'

    const options: Parameters<ReservoirSDKActions['listToken']>[0]['options'] =
      {
        orderbook: 'reservoir',
        automatedRoyalties: false,
      
      }

    if (!ORDER_KIND) options.orderKind = 'seaport'

    if (ORDER_KIND) options.orderKind = ORDER_KIND as typeof options.orderKind
    if (SOURCE_ID) options.source = SOURCE_ID
    if (FEE_BPS) options.fee = FEE_BPS
    if (FEE_RECIPIENT) options.feeRecipient = FEE_RECIPIENT

    ReservoirSDK.client()
      .actions.listToken({
        signer,
        weiPrice: ethers.utils.parseEther(listingPrice).toString(),
        token: `${token_?.contract}:${token_?.tokenId}`,
        expirationTime: expirationValue,
        options: options,
        onProgress: setSteps,
      })
      .then(handleSuccess)
      .catch(handleError)

    setWaitingTx(false)
  }

  const onContinue = async () => {
    setWaitingTx(true)

    setOrderbook(['opensea'])

    const expirationValue = expirationPresets
      .find(({ preset }) => preset === expiration)
      ?.value()

    if (!signer) throw 'signer is undefined'

    const options: Parameters<ReservoirSDKActions['listToken']>[0]['options'] =
      {
        automatedRoyalties: false,
      }

    if (SOURCE_ID) options.source = SOURCE_ID

    if (postOnOpenSea) {
      ReservoirSDK.client()
        .actions.listToken({
          signer,
          weiPrice: ethers.utils.parseEther(listingPrice).toString(),
          token: `${token_?.contract}:${token_?.tokenId}`,
          expirationTime: expirationValue,
          options: options,
          onProgress: setSteps,
        })
        .then(handleSuccess)
        .catch(handleError)
    }

    setWaitingTx(false)
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        disabled={isInTheWrongNetwork}
        onClick={async (e) => {
          setPostOnOpenSea(false)
          setOrderbook(['reservoir'])
        }}
      >
        {children ? (
          children
        ) : token?.market?.floorAsk?.price ? (
          <p className="btn-primary-fill w-full dark:ring-primary-900 dark:focus:ring-4">
            Edit Listing
          </p>
        ) : (
          <div className="btn-primary-fill w-full dark:ring-primary-900 dark:focus:ring-4">
            {token?.market?.floorAsk?.price ? 'Edit Listing' : 'List for Sale'}
          </div>
        )}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay>
          <ModalCard
            loading={waitingTx}
            orderbook={orderbook}
            title="List Token for Sale"
            onCloseCallback={() => setSteps(undefined)}
            onContinue={onContinue}
            steps={steps}
            actionButton={
              <button
                disabled={waitingTx || isInTheWrongNetwork}
                onClick={() => {
                  if (!signer) {
                    dispatch({ type: 'CONNECT_WALLET', payload: true })
                    return
                  }
                  execute()
                }}
                className="btn-primary-fill w-full dark:text-white  dark:ring-primary-900 dark:focus:ring-4"
              >
                {waitingTx ? (
                  <CgSpinner className="h-4 w-4 animate-spin" />
                ) : (
                  'List'
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
                  Price (ETH)
                </label>
                <input
                  placeholder="Amount"
                  id="price"
                  type="number"
                  min={0}
                  step={0.01}
                  value={listingPrice}
                  onChange={(e) => setListingPrice(e.target.value)}
                  className="input-primary-outline w-[160px] dark:border-neutral-600 dark:bg-neutral-900 dark:text-white dark:ring-primary-900 dark:focus:ring-4"
                />
              </div>
              <div className="flex items-center justify-between">
                <ExpirationSelector
                  presets={expirationPresets}
                  setExpiration={setExpiration}
                  expiration={expiration}
                />
              </div>
              {!!OPENSEA_CROSS_POST && (
                <div className="flex items-center gap-3">
                  <label
                    htmlFor="postOpenSea"
                    className="reservoir-h6 font-headings dark:text-white"
                  >
                    Post listing to OpenSea
                  </label>
                  <input
                    type="checkbox"
                    name="postOpenSea"
                    id="postOpenSea"
                    className="scale-125 transform"
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
              )}
              <div className="flex justify-between">
                <div className="reservoir-h6 font-headings dark:text-white">
                  Fees
                </div>
                <div className="reservoir-body text-right dark:text-white">
                  <div>Royalty {royaltyPercentage}</div>
                  {FEE_BPS && (
                    <div>
                      {SOURCE_ID ? SOURCE_ID : 'Marketplace'}{' '}
                      {(+FEE_BPS / 10000) * 100}%
                    </div>
                  )}
                  {postOnOpenSea && (
                    <div>
                      OpenSea 2.5%<sup>*</sup>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-between">
                <div className="reservoir-h6 font-headings dark:text-white">
                  You get
                </div>
                <div className="reservoir-h6 font-headings dark:text-white">
                  <FormatEth amount={youGet} logoWidth={10} />
                </div>
              </div>
              {postOnOpenSea && (
                <div className="reservoir-small dark:text-white">
                  <sup>*</sup>Only one marketplace fee will be applied to this
                  listing at time of sale. Note: Fees may vary based on where
                  the item is sold.
                </div>
              )}
            </div>
          </ModalCard>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default ListModal

const expirationPresets = [
  {
    preset: 'oneHour',
    value: () =>
      DateTime.now().plus({ hours: 1 }).toMillis().toString().slice(0, -3),
    display: '1 Hour',
  },
  {
    preset: 'oneWeek',
    value: () =>
      DateTime.now().plus({ weeks: 1 }).toMillis().toString().slice(0, -3),
    display: '1 Week',
  },
  {
    preset: 'oneMonth',
    value: () =>
      DateTime.now().plus({ months: 1 }).toMillis().toString().slice(0, -3),
    display: '1 Month',
  },
  {
    preset: 'none',
    value: () => '0',
    display: 'None',
  },
]
