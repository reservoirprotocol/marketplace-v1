import { ClassAttributes, FC, useEffect, useRef, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { HiX } from 'react-icons/hi'
import ExpirationSelector from './ExpirationSelector'
import { DateTime } from 'luxon'
import { BigNumber, constants, ethers } from 'ethers'
import { paths } from 'interfaces/apiTypes'
import { optimizeImage } from 'lib/optmizeImage'
import { formatBN } from 'lib/numbers'
import { getWeth, makeOffer } from 'lib/makeOffer'
import { useBalance, useProvider, useSigner } from 'wagmi'
import calculateOffer from 'lib/calculateOffer'
import { Weth } from '@reservoir0x/sdk/dist/common/helpers'
import { MutatorCallback } from 'swr'

const apiBase = process.env.NEXT_PUBLIC_API_BASE
const openSeaApiKey = process.env.NEXT_PUBLIC_OPENSEA_API_KEY

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
const OfferModal: FC<Props> = ({
  maker,
  tokens,
  collection,
  chainId,
  mutate,
}) => {
  const [expiration, setExpiration] = useState<string>('oneDay')
  const [isCollectionWide, setIsCollectionWide] = useState<boolean>(false)
  const [postOnOpenSea, setPostOnOpenSea] = useState<boolean>(false)
  const [waitingTx, setWaitingTx] = useState<boolean>(false)
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
  const [offerPrice, setOfferPrice] = useState<string>('0')
  const [weth, setWeth] = useState<{
    weth: Weth
    balance: BigNumber
  } | null>(null)
  const [{ data: signer }] = useSigner()
  const [{ data: ethBalance }, getBalance] = useBalance()
  const provider = useProvider()
  const token = tokens?.tokens?.[0]
  const bps = collection?.collection?.royalties?.bps ?? 0
  const royaltyPercentage = `${bps / 100}%`
  const closeButton = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    async function loadWeth() {
      if (signer) {
        await getBalance({ addressOrName: await signer?.getAddress() })
        const weth = await getWeth(chainId, provider, signer)
        if (weth) {
          setWeth(weth)
        }
      }
    }
    loadWeth()
  }, [signer])

  useEffect(() => {
    const userInput = ethers.utils.parseEther(offerPrice)
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
              <Dialog.Title className="uppercase opacity-75 font-medium text-lg">
                Offer to purchase
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
                alt=""
                className="w-[50px]"
              />
              <div className="overflow-auto">
                <div className="text-lg font-medium mb-1">
                  {token?.token?.name}
                </div>
                <div className="text-sm">{token?.token?.collection?.name}</div>
              </div>
            </div>
            <div className="space-y-5 mb-8">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="price"
                  className="uppercase opacity-75 font-medium"
                >
                  Price (wETH)
                </label>
                <input
                  placeholder="Insert offer price"
                  id="price"
                  type="number"
                  min={0}
                  step={0.01}
                  value={offerPrice}
                  onChange={(e) =>
                    // Do not set offer price to empty strings
                    e.target.value !== '' && setOfferPrice(e.target.value)
                  }
                  className="input-blue-outline w-[100px]"
                />
              </div>
              {calculations.error && (
                <div className="px-2 py-1 bg-red-100 text-red-900 rounded-md">
                  {calculations.error}
                </div>
              )}
              {calculations.warning && (
                <div className="px-2 py-1 bg-yellow-100 text-yellow-900 rounded-md">
                  {calculations.warning}
                </div>
              )}
              <div className="flex items-center gap-3">
                <label
                  htmlFor="postOpenSea"
                  className="uppercase opacity-75 font-medium"
                >
                  Post order on OpenSea
                </label>
                <input
                  type="checkbox"
                  name="postOpenSea"
                  id="postOpenSea"
                  className="transform scale-125"
                  checked={postOnOpenSea}
                  onChange={(e) => setPostOnOpenSea(e.target.checked)}
                />
              </div>
              <div className="flex items-center gap-3">
                <label
                  htmlFor="postOpenSea"
                  className="uppercase opacity-75 font-medium"
                >
                  Collection wide offer
                </label>
                <input
                  type="checkbox"
                  name="isCollectionWide"
                  id="isCollectionWide"
                  className="transform scale-125"
                  checked={isCollectionWide}
                  onChange={(e) => setIsCollectionWide(e.target.checked)}
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
                  <span>{formatBN(calculations.fee, 5)}</span>
                  <div>Marketplace (0%)</div>
                  <span>{formatBN(0, 5)}</span>
                </div>
              </div>
              <div className="flex justify-between">
                <div className="uppercase opacity-75 font-medium">
                  Total Cost
                </div>
                <div className="font-mono">{formatBN(+offerPrice, 2)}</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Dialog.Close asChild>
                <button className="btn-neutral-fill w-full justify-center">
                  Cancel
                </button>
              </Dialog.Close>
              <button
                disabled={
                  +offerPrice <= 0 ||
                  !calculations.missingEth.isZero() ||
                  waitingTx
                }
                onClick={async () => {
                  const expirationValue = expirationPresets
                    .find(({ preset }) => preset === expiration)
                    ?.value()

                  const fee = collection.collection?.royalties?.bps?.toString()

                  if (
                    !apiBase ||
                    !openSeaApiKey ||
                    !signer ||
                    !maker ||
                    !expirationValue ||
                    !fee ||
                    !ethBalance
                  ) {
                    console.debug({
                      apiBase,
                      openSeaApiKey,
                      signer,
                      maker,
                      expirationValue,
                      fee,
                      ethBalance,
                    })
                    return
                  }

                  const feeRecipient =
                    collection?.collection?.royalties?.recipient || maker

                  let query: Parameters<typeof makeOffer>[6] = {
                    maker,
                    side: 'buy',
                    price: calculations.total.toString(),
                    fee,
                    feeRecipient,
                    expirationTime: expirationValue,
                  }

                  if (isCollectionWide) {
                    query.collection = token?.token?.collection?.id
                  } else {
                    query.contract = token?.token?.contract
                    query.tokenId = token?.token?.tokenId
                  }

                  console.debug({ query })
                  // Set loading state for UI
                  setWaitingTx(true)

                  // Wait for transactions to complete
                  try {
                    await makeOffer(
                      chainId,
                      provider,
                      calculations.total,
                      apiBase,
                      openSeaApiKey,
                      signer,
                      query,
                      postOnOpenSea,
                      calculations.missingWeth
                    )
                    // Close modal
                    // closeButton.current?.click()
                    await mutate()
                    setWaitingTx(false)
                  } catch (error) {
                    setWaitingTx(false)
                  }
                }}
                className="btn-blue-fill w-full justify-center"
              >
                {waitingTx ? 'Waiting...' : 'Make Offer'}
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
