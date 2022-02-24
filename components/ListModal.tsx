import { ComponentProps, FC, useEffect, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import ExpirationSelector from './ExpirationSelector'
import { DateTime } from 'luxon'
import { BigNumber, constants, ethers } from 'ethers'
import { paths } from 'interfaces/apiTypes'
import { useConnect, useNetwork } from 'wagmi'
import FormatEth from './FormatEth'
import { SWRResponse } from 'swr'
import { Execute } from 'lib/executeSteps'
import listToken from 'lib/actions/listToken'
import ModalCard from './modal/ModalCard'
import Toast from './Toast'

type Props = {
  apiBase: string
  chainId: number
  signer: ethers.Signer | undefined
  maker: string | undefined
  details: SWRResponse<
    paths['/tokens/details']['get']['responses']['200']['schema'],
    any
  >
  collection:
    | paths['/collections/{collection}']['get']['responses']['200']['schema']
    | undefined
  setToast: (data: ComponentProps<typeof Toast>['data']) => any
}

const ListModal: FC<Props> = ({
  maker,
  collection,
  chainId,
  apiBase,
  signer,
  details,
  setToast,
}) => {
  const [expiration, setExpiration] = useState('oneWeek')
  const [listingPrice, setListingPrice] = useState('')
  const [{ data: connectData }, connect] = useConnect()
  const [steps, setSteps] = useState<Execute['steps']>()
  const [youGet, setYouGet] = useState(constants.Zero)
  const [waitingTx, setWaitingTx] = useState<boolean>(false)
  const [{ data: network }] = useNetwork()
  const token = details.data?.tokens?.[0]
  const bps = collection?.collection?.royalties?.bps ?? 0
  const royaltyPercentage = `${bps / 100}%`
  const isInTheWrongNetwork = network.chain?.id !== +chainId

  useEffect(() => {
    const userInput = ethers.utils.parseEther(
      listingPrice === '' ? '0' : listingPrice
    )

    let fee = userInput.mul(BigNumber.from(bps)).div(BigNumber.from('10000'))
    let total = userInput.sub(fee)
    setYouGet(total)
  }, [listingPrice])

  const data: ComponentProps<typeof ModalCard>['data'] = {
    token: {
      contract: token?.token?.contract,
      floorSellValue: token?.market?.floorSell?.value,
      id: token?.token?.tokenId,
      image: token?.token?.image,
      name: token?.token?.name,
      topBuyValue: token?.market?.topBuy?.value,
    },
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button
          disabled={isInTheWrongNetwork}
          className="btn-neutral-fill-dark w-full"
        >
          {token?.market?.floorSell?.value ? 'Edit Listing' : 'List for sale'}
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay>
          <ModalCard
            title="List Token for Sale"
            data={data}
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
                      contract: token?.token?.contract,
                      maker,
                      price: ethers.utils.parseEther(listingPrice).toString(),
                      tokenId: token?.token?.tokenId,
                      expirationTime: expirationValue,
                    },
                    signer,
                    apiBase,
                    setSteps,
                    handleSuccess: () => details.mutate(),
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
                className="btn-blue-fill w-full"
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
