import { FC, useRef, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { HiX } from 'react-icons/hi'
import ExpirationSelector from './ExpirationSelector'
import { DateTime } from 'luxon'
import { listTokenForSell } from 'lib/acceptOffer'
import { ethers } from 'ethers'
import { paths } from 'interfaces/apiTypes'
import { optimizeImage } from 'lib/optmizeImage'
import { formatBN } from 'lib/numbers'
import { MutatorCallback } from 'swr/dist/types'

type Props = {
  apiBase: string
  chainId: number
  signer: ethers.Signer | undefined
  maker: string | undefined
  tokens:
    | paths['/tokens/details']['get']['responses']['200']['schema']
    | undefined
  collection: paths['/collections/{collection}']['get']['responses']['200']['schema']
  mutate: MutatorCallback
}

const ListModal: FC<Props> = ({
  maker,
  tokens,
  collection,
  chainId,
  apiBase,
  signer,
  mutate,
}) => {
  const [expiration, setExpiration] = useState('oneWeek')
  const [listingPrice, setListingPrice] = useState('0')
  const [waitingTx, setWaitingTx] = useState<boolean>(false)
  const token = tokens?.tokens?.[0]
  const bps = collection?.collection?.royalties?.bps ?? 0
  const royaltyPercentage = `${bps / 100}%`
  const closeButton = useRef<HTMLButtonElement>(null)

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className="btn-blue-fill w-full justify-center">
          {token?.market?.floorSell?.value ? 'Edit Listing' : 'List for sell'}
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="absolute inset-0 h-screen backdrop-blur-sm">
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-6 w-[350px] bg-white shadow-md rounded-md">
            <div className="flex justify-between items-center mb-5">
              <Dialog.Title className="uppercase opacity-75 font-medium text-lg">
                List Token for Sale
              </Dialog.Title>
              <Dialog.Close asChild>
                <button ref={closeButton} className="btn-neutral-ghost p-1.5">
                  <HiX className="h-5 w-5 " />
                </button>
              </Dialog.Close>
            </div>
            <div className="flex gap-4 items-center mb-8">
              <img
                src={optimizeImage(token?.token?.image, {
                  sm: 50,
                  md: 50,
                  lg: 50,
                  xl: 50,
                  '2xl': 50,
                })}
                alt={token?.token?.name}
                className="w-[50px]"
              />
              <div className="overflow-auto">
                <div className="text-lg font-medium mb-1">
                  {token?.token?.name}
                </div>
                <div className="text-sm">{token?.token?.collection?.name}</div>
              </div>
            </div>
            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="price"
                  className="uppercase opacity-75 font-medium"
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
              <div>
                <div className="uppercase opacity-75 font-medium mb-2">
                  Expiration
                </div>
                <ExpirationSelector
                  presets={expirationPresets}
                  setExpiration={setExpiration}
                  expiration={expiration}
                />
              </div>

              <div className="flex justify-between">
                <div className="uppercase opacity-75 font-medium">Fees</div>
                <div className="grid gap-1.5 grid-cols-[4fr_1fr] justify-end text-right">
                  <div>Royalty ({royaltyPercentage})</div>
                  <span>{formatBN(0, 5)}</span>
                  <div>Marketplace (0%)</div>
                  <span>{formatBN(0, 5)}</span>
                </div>
              </div>
              <div className="flex justify-between">
                <div className="uppercase opacity-75 font-medium">You get</div>
                <div className="font-mono">{formatBN(+listingPrice, 2)}</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Dialog.Close asChild>
                <button className="btn-neutral-fill w-full justify-center">
                  Cancel
                </button>
              </Dialog.Close>
              <button
                disabled={waitingTx}
                onClick={async () => {
                  const expirationValue = expirationPresets
                    .find(({ preset }) => preset === expiration)
                    ?.value()

                  const contract = token?.token?.contract
                  const fee = collection?.collection?.royalties?.bps?.toString()

                  if (!contract || !maker || !fee || !expirationValue) {
                    console.debug({
                      contract,
                      maker,
                      fee,
                      expirationValue,
                    })
                    return
                  }

                  const query: Parameters<typeof listTokenForSell>['3'] = {
                    contract,
                    maker,
                    side: 'sell',
                    price: ethers.utils.parseEther(listingPrice).toString(),
                    fee,
                    feeRecipient:
                      collection?.collection?.royalties?.recipient || maker,
                    tokenId: token?.token?.tokenId,
                    expirationTime: expirationValue,
                  }

                  setWaitingTx(true)
                  try {
                    await listTokenForSell(apiBase, chainId, signer, query)
                    // Close modal
                    // closeButton.current?.click()
                    await mutate()
                    setWaitingTx(false)
                  } catch (error) {
                    console.error(error)
                    setWaitingTx(false)
                  }
                }}
                className="btn-blue-fill w-full justify-center"
              >
                {waitingTx ? 'Waiting...' : 'List'}
              </button>
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
    value: () => DateTime.now().plus({ hours: 1 }).toMillis().toString(),
    display: '1 Hour',
  },
  {
    preset: 'oneWeek',
    value: () => DateTime.now().plus({ weeks: 1 }).toMillis().toString(),
    display: '1 Week',
  },
  {
    preset: 'oneMonth',
    value: () => DateTime.now().plus({ months: 1 }).toMillis().toString(),
    display: '1 Month',
  },
  {
    preset: 'none',
    value: () => '0',
    display: 'None',
  },
]
