import { ComponentProps, FC, useEffect, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import ExpirationSelector from './ExpirationSelector'
import { DateTime } from 'luxon'
import { BigNumber, constants, ethers } from 'ethers'
import { paths } from 'interfaces/apiTypes'
import { useConnect } from 'wagmi'
import FormatEth from './FormatEth'
import { SWRResponse } from 'swr'
import { Execute } from 'lib/executeSteps'
import listToken from 'lib/actions/listToken'
import ModalCard from './modal/ModalCard'
import Toast from './Toast'
import { SWRInfiniteResponse } from 'swr/infinite/dist/infinite'
import { getCollection, getDetails } from 'lib/fetch/fetch'
import { CgSpinner } from 'react-icons/cg'

type Details = paths['/tokens/details']['get']['responses']['200']['schema']
type Collection =
  paths['/collections/{collection}']['get']['responses']['200']['schema']

type Props = {
  apiBase: string
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
  signer: ethers.Signer | undefined
}

const ListModal: FC<Props> = ({
  data,
  maker,
  isInTheWrongNetwork,
  apiBase,
  signer,
  mutate,
  setToast,
}) => {
  // wagmi
  const [{ data: connectData }, connect] = useConnect()

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

  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (data && open) {
      // Load data if missing
      if ('tokenId' in data) {
        const { contract, tokenId, collectionId } = data

        getDetails(apiBase, contract, tokenId, setDetails)
        getCollection(apiBase, collectionId, setCollection)
      }
      // Load data if provided
      if ('details' in data) {
        const { details, collection } = data

        setDetails(details)
        setCollection(collection)
      }
    }
  }, [data, open])

  let bps = 0

  if ('details' in data) {
    bps = data?.collection?.collection?.royalties?.bps || 0
  }
  if ('tokenId' in data) {
    bps = collection?.collection?.royalties?.bps || 0
  }

  const royaltyPercentage = `${bps / 100}%`

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

  const { market, token: token_ } = token

  const tokenData: ComponentProps<typeof ModalCard>['data'] = {
    token: {
      contract: token_?.contract,
      floorSellValue: market?.floorSell?.value,
      id: token_?.tokenId,
      image: token_?.image,
      name: token_?.name,
      topBuyValue: market?.topBuy?.value,
    },
  }

  const handleError: Parameters<typeof listToken>[0]['handleError'] = (
    err: any
  ) => {
    // Handle user rejection
    if (err?.code === 4001) {
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
      title: 'Could not list token',
    })
  }

  const handleSuccess: Parameters<
    typeof listToken
  >[0]['handleSuccess'] = () => {
    details && 'mutate' in details && details.mutate()
    mutate && mutate()
  }

  const checkWallet = async () => {
    if (!signer) {
      const data = await connect(connectData.connectors[0])
      if (data?.data) {
        setToast({
          kind: 'success',
          message: 'Connected your wallet successfully.',
          title: 'Wallet connected',
        })
      }
    }
  }

  const execute = async () => {
    await checkWallet()

    setWaitingTx(true)

    const expirationValue = expirationPresets
      .find(({ preset }) => preset === expiration)
      ?.value()

    await listToken({
      query: {
        contract: token_?.contract,
        orderbook: 'reservoir',
        maker,
        price: ethers.utils.parseEther(listingPrice).toString(),
        tokenId: token_?.tokenId,
        expirationTime: expirationValue,
      },
      signer,
      apiBase,
      setSteps,
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

    if (!signer) return

    if (postOnOpenSea) {
      await listToken({
        query: {
          contract: token_?.contract,
          orderbook: 'opensea',
          maker,
          price: ethers.utils.parseEther(listingPrice).toString(),
          tokenId: token_?.tokenId,
          expirationTime: expirationValue,
        },
        signer,
        apiBase,
        setSteps,
        handleSuccess,
        handleError,
      })
    }

    setWaitingTx(false)
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          disabled={isInTheWrongNetwork}
          onClick={async () => {
            setPostOnOpenSea(false)
            setOrderbook(['reservoir'])
            await checkWallet()
          }}
          className="btn-primary-fill w-full"
        >
          {token?.market?.floorSell?.value ? 'Edit Listing' : 'List for Sale'}
        </button>
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
                onClick={execute}
                className="btn-primary-fill w-full"
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
                <label htmlFor="price" className="reservoir-h6">
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
                  className="input-primary-outline w-[160px]"
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
                <div className="reservoir-h6">You get</div>
                <div className="reservoir-h6">
                  <FormatEth
                    amount={youGet}
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
