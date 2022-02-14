import { FC, useEffect, useRef, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { HiCheckCircle, HiMinusCircle, HiX } from 'react-icons/hi'
import ExpirationSelector from './ExpirationSelector'
import { DateTime } from 'luxon'
import { BigNumber, constants, ethers } from 'ethers'
import { paths } from 'interfaces/apiTypes'
import { optimizeImage } from 'lib/optmizeImage'
import { useNetwork } from 'wagmi'
import FormatEth from './FormatEth'
import { pollSwr } from 'lib/pollApi'
import { SWRResponse } from 'swr'
import executeSteps, { Execute } from 'lib/executeSteps'
import Steps from './Steps'
import setParams from 'lib/params'

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
}

const ListModal: FC<Props> = ({
  maker,
  collection,
  chainId,
  apiBase,
  signer,
  details,
}) => {
  const [expiration, setExpiration] = useState('oneWeek')
  const [listingPrice, setListingPrice] = useState('')
  const [steps, setSteps] = useState<Execute['steps']>()
  const [youGet, setYouGet] = useState(constants.Zero)
  const [success, setSuccess] = useState<boolean>(false)
  const [waitingTx, setWaitingTx] = useState<boolean>(false)
  const [{ data: network }] = useNetwork()
  const token = details.data?.tokens?.[0]
  const bps = collection?.collection?.royalties?.bps ?? 0
  const royaltyPercentage = `${bps / 100}%`
  const closeButton = useRef<HTMLButtonElement>(null)
  const isInTheWrongNetwork = network.chain?.id !== +chainId

  useEffect(() => {
    const userInput = ethers.utils.parseEther(
      listingPrice === '' ? '0' : listingPrice
    )

    let fee = userInput.mul(BigNumber.from(bps)).div(BigNumber.from('10000'))
    let total = userInput.sub(fee)
    setYouGet(total)
  }, [listingPrice])

  return (
    <Dialog.Root onOpenChange={() => setSuccess(false)}>
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
          <Dialog.Content className="fixed inset-0 bg-[#000000b6]">
            <div className="fixed top-1/2 left-1/2 w-[350px] -translate-x-1/2 -translate-y-1/2 transform rounded-md bg-white p-6 shadow-md">
              <div className="mb-5 flex items-center justify-between">
                <Dialog.Title className="text-lg font-medium uppercase opacity-75">
                  List Token for Sale
                </Dialog.Title>
                <Dialog.Close asChild>
                  <button ref={closeButton} className="btn-neutral-ghost p-1.5">
                    <HiX className="h-5 w-5 " />
                  </button>
                </Dialog.Close>
              </div>
              <div className="mb-8 flex items-center gap-4">
                <img
                  src={optimizeImage(token?.token?.image, 50)}
                  alt={token?.token?.name}
                  className="w-[50px]"
                />
                <div className="overflow-auto">
                  <div className="mb-1 text-lg font-medium">
                    {token?.token?.name}
                  </div>
                  <div className="text-sm">
                    {token?.token?.collection?.name}
                  </div>
                </div>
              </div>
              {steps ? (
                <Steps steps={steps} />
              ) : (
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
                    <div className="font-medium uppercase opacity-75">
                      You get
                    </div>
                    <div className="text-2xl font-bold">
                      <FormatEth
                        amount={youGet}
                        maximumFractionDigits={4}
                        logoWidth={10}
                      />
                    </div>
                  </div>
                </div>
              )}
              {success ? (
                <Dialog.Close asChild>
                  <button className="btn-green-fill w-full">
                    Success, Close this menu
                  </button>
                </Dialog.Close>
              ) : (
                <div className="flex items-center gap-4">
                  <Dialog.Close asChild>
                    <button className="btn-neutral-fill w-full">Cancel</button>
                  </Dialog.Close>
                  <button
                    disabled={waitingTx || isInTheWrongNetwork}
                    onClick={async () => {
                      // Get the expiration time as a UNIX timestamp
                      const expirationValue = expirationPresets
                        .find(({ preset }) => preset === expiration)
                        ?.value()

                      const contract = token?.token?.contract
                      const tokenId = token?.token?.tokenId
                      const fee =
                        collection?.collection?.royalties?.bps?.toString()

                      if (
                        !contract ||
                        !maker ||
                        !fee ||
                        !expirationValue ||
                        !signer ||
                        !tokenId
                      ) {
                        console.error('Some data is undefined.', {
                          contract,
                          maker,
                          fee,
                          expirationValue,
                          signer,
                          tokenId,
                        })
                        return
                      }

                      const url = new URL('/execute/list', apiBase)

                      const query: paths['/execute/list']['get']['parameters']['query'] =
                        {
                          contract,
                          maker,
                          price: ethers.utils
                            .parseEther(listingPrice)
                            .toString(),
                          tokenId,
                          expirationTime: expirationValue,
                        }

                      setParams(url, query)

                      setWaitingTx(true)

                      try {
                        await executeSteps(url, signer, (execute) =>
                          setSteps(execute.steps)
                        )
                        // Close modal
                        // closeButton.current?.click()
                        await pollSwr(details.data, details.mutate)
                        setSuccess(true)
                      } catch (err) {
                        console.error(err)
                      }

                      setWaitingTx(false)
                    }}
                    className="btn-blue-fill w-full"
                  >
                    {waitingTx ? 'Waiting...' : 'List'}
                  </button>
                </div>
              )}
            </div>
          </Dialog.Content>
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
