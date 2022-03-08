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
  const [listingPrice, setListingPrice] = useState('')
  const [youGet, setYouGet] = useState(constants.Zero)

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
        const { contract, tokenId } = data

        getDetails(apiBase, contract, tokenId, setDetails)
      }
      // Load data if provided
      if ('details' in data) {
        const { details, collection } = data

        setDetails(details)
        setCollection(collection)
      }
    }
  }, [data, open])

  const bps = collection?.collection?.royalties?.bps ?? 0
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

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          disabled={isInTheWrongNetwork}
          className="btn-primary-fill w-full"
        >
          {token?.market?.floorSell?.value ? 'Edit Listing' : 'List for Sale'}
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay>
          <ModalCard
            title="List Token for Sale"
            data={tokenData}
            onCloseCallback={() => setSteps(undefined)}
            steps={steps}
            actionButton={
              <button
                disabled={waitingTx || isInTheWrongNetwork}
                onClick={async () => {
                  if (!signer) {
                    const data = await connect(connectData.connectors[0])
                    if (data?.data) {
                      setToast({
                        kind: 'success',
                        message: 'Connected your wallet successfully.',
                        title: 'Wallet connected',
                      })
                    }
                    return
                  }

                  setWaitingTx(true)

                  const expirationValue = expirationPresets
                    .find(({ preset }) => preset === expiration)
                    ?.value()

                  await listToken({
                    query: {
                      contract: token_?.contract,
                      maker,
                      price: ethers.utils.parseEther(listingPrice).toString(),
                      tokenId: token_?.tokenId,
                      expirationTime: expirationValue,
                    },
                    signer,
                    apiBase,
                    setSteps,
                    handleSuccess: () => {
                      details && 'mutate' in details && details.mutate()
                      mutate && mutate()
                    },
                    handleError: (err: any) => {
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
                    },
                  })
                  setWaitingTx(false)
                }}
                className="btn-primary-fill w-full"
              >
                {waitingTx ? 'Waiting...' : 'List'}
              </button>
            }
          >
            <div className="mb-8 space-y-5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="price"
                  className="font-medium uppercase opacity-75"
                >
                  Price (ETH)
                </label>
                <input
                  placeholder="Choose a price"
                  id="price"
                  type="number"
                  min={0}
                  step={0.01}
                  value={listingPrice}
                  onChange={(e) => setListingPrice(e.target.value)}
                  className="input-blue-outline w-[140px]"
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
                <div className="font-medium uppercase opacity-75">Fees</div>
                <div className="text-right">
                  <div>Royalty {royaltyPercentage}</div>
                  <div>Marketplace 0%</div>
                </div>
              </div>
              <div className="flex justify-between">
                <div className="font-medium uppercase opacity-75">You get</div>
                <div className="text-2xl font-bold">
                  <FormatEth
                    amount={youGet}
                    maximumFractionDigits={4}
                    logoWidth={10}
                  />
                </div>
              </div>
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
