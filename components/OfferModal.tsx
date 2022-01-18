import { FC, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { HiX } from 'react-icons/hi'
import ExpirationSelector from './ExpirationSelector'
import { DateTime } from 'luxon'
import { ethers } from 'ethers'
import { paths } from 'interfaces/apiTypes'

type Props = {
  API_BASE: string
  CHAIN_ID: number
  signer: ethers.Signer | undefined
  maker: string | undefined
  tokens:
    | paths['/tokens/details']['get']['responses']['200']['schema']
    | undefined
  collection: paths['/collections/{collection}']['get']['responses']['200']['schema']
}

const OfferModal: FC<Props> = ({
  maker,
  tokens,
  collection,
  CHAIN_ID,
  API_BASE,
  signer,
}) => {
  const [expiration, setExpiration] = useState('oneDay')

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button
          disabled={!signer}
          className="btn-blue-fill w-full justify-center"
        >
          Make Offer
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="absolute inset-0 h-screen backdrop-blur-sm">
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-6 w-[330px] bg-white shadow-md rounded-md">
            <div className="flex justify-between items-center mb-5">
              <Dialog.Title className="uppercase opacity-75 font-medium">
                List Token for Sale
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="btn-neutral-ghost p-1.5">
                  <HiX className="h-5 w-5 " />
                </button>
              </Dialog.Close>
            </div>
            <div className="flex gap-4 items-center mb-8">
              <img
                src="https://via.placeholder.com/50"
                alt=""
                className="w-[50px]"
              />
              <div className="overflow-auto">
                <div className="text-lg font-medium mb-1">#123 Apple</div>
                <div className="text-sm">Loot</div>
              </div>
            </div>
            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="price"
                  className="uppercase opacity-75 font-medium"
                >
                  Price (wETH)
                </label>
                <input
                  placeholder="Choose a price"
                  id="price"
                  type="text"
                  className="input-blue-outline w-[120px]"
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
                <div className="text-right">
                  <div>Royalty 5%</div>
                  <div>Marketplace 0%</div>
                </div>
              </div>
              <div className="flex justify-between">
                <div className="uppercase opacity-75 font-medium">
                  Total Cost
                </div>
                <div className="font-mono">0.4</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Dialog.Close asChild>
                <button className="btn-neutral-fill w-full justify-center">
                  Cancel
                </button>
              </Dialog.Close>
              <button className="btn-blue-fill w-full justify-center">
                Make Offer
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default OfferModal

const expirationPresets = [
  {
    preset: 'oneHour',
    value: () => DateTime.now().plus({ hours: 1 }).toMillis().toString(),
    display: '1 Hour',
  },
  {
    preset: 'oneDay',
    value: () => DateTime.now().plus({ days: 1 }).toMillis().toString(),
    display: '1 Day',
  },
  {
    preset: 'oneWeek',
    value: () => DateTime.now().plus({ weeks: 1 }).toMillis().toString(),
    display: '1 Week',
  },
  {
    preset: 'none',
    value: () => '0',
    display: 'None',
  },
]
