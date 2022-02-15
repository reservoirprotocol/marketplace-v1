import { FC, ReactNode, useEffect, useRef, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { HiX } from 'react-icons/hi'
import ExpirationSelector from './ExpirationSelector'
import { BigNumber, constants, ethers } from 'ethers'
import { optimizeImage } from 'lib/optmizeImage'
import { useBalance, useNetwork, useProvider, useSigner } from 'wagmi'
import calculateOffer from 'lib/calculateOffer'
import { SWRResponse } from 'swr'
import FormatEth from './FormatEth'
import expirationPresets from 'lib/offerExpirationPresets'
import { paths } from 'interfaces/apiTypes'
import { Common } from '@reservoir0x/sdk'
import getWeth from 'lib/getWeth'
import executeSteps, { Execute } from 'lib/executeSteps'
import Steps from './Steps'
import setParams from 'lib/params'

type Props = {
  trigger?: ReactNode
  env: {
    apiBase: string
    chainId: ChainId
    openSeaApiKey: string | undefined
  }
  data: {
    token: {
      image: string | undefined
      name: string | undefined
      id: string | undefined
      contract: string | undefined
      topBuyValue: number | undefined
      floorSellValue: number | undefined
    }
    collection: {
      name: string | undefined
    }
  }
  royalties: {
    bps: number | undefined
    recipient: string | undefined
  }
  signer: ethers.Signer | undefined
  details: SWRResponse<
    paths['/tokens/details']['get']['responses']['200']['schema'],
    any
  >
}

const TokenOfferModal: FC<Props> = ({
  trigger,
  env,
  royalties,
  details,
  data,
}) => {
  const [expiration, setExpiration] = useState<string>('oneDay')
  const [postOnOpenSea, setPostOnOpenSea] = useState<boolean>(false)
  const [waitingTx, setWaitingTx] = useState<boolean>(false)
  const [steps, setSteps] = useState<Execute['steps']>()
  const [success, setSuccess] = useState<boolean>(false)
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
  const provider = useProvider()
  const bps = royalties?.bps ?? 0
  const royaltyPercentage = `${bps / 100}%`
  const closeButton = useRef<HTMLButtonElement>(null)
  const isInTheWrongNetwork = network.chain?.id !== env.chainId

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

  return (
    <Dialog.Root onOpenChange={() => setSuccess(false)}>
      <Dialog.Trigger asChild>
        {trigger ?? (
          <button
            disabled={!signer || isInTheWrongNetwork}
            className="btn-neutral-outline w-full border-neutral-900"
          >
            Make Offer
          </button>
        )}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay>
          <Dialog.Content className="fixed inset-0 bg-[#000000b6]">
            <div className="fixed top-1/2 left-1/2 w-[360px] -translate-x-1/2 -translate-y-1/2 transform rounded-md bg-white p-6 shadow-md ">
              <div className="mb-5 flex items-center justify-between">
                <Dialog.Title className="text-lg font-medium uppercase opacity-75">
                  Make a token offer
                </Dialog.Title>
                <Dialog.Close asChild>
                  <button ref={closeButton} className="btn-neutral-ghost p-1.5">
                    <HiX className="h-5 w-5 " />
                  </button>
                </Dialog.Close>
              </div>
              <div className="mb-3 flex items-center gap-4">
                <img
                  src={optimizeImage(data.token.image, 50)}
                  alt=""
                  className="w-[50px]"
                />
                <div className="overflow-auto">
                  <div className="text-sm">{data.collection.name}</div>
                  <div className="my-1.5 text-lg font-medium">
                    {data.token.name}
                  </div>
                  <div className="mb-1.5 text-sm">1 Eligible Token</div>
                </div>
              </div>
              <div className="mb-5 flex flex-wrap items-stretch gap-1.5 text-sm">
                {data.token.topBuyValue && (
                  <div className="flex items-center gap-2 rounded-md bg-blue-100 px-2 py-0.5 text-blue-900">
                    <span className="whitespace-nowrap">Current Top Offer</span>
                    <div className="font-semibold">
                      <FormatEth
                        amount={data.token.topBuyValue}
                        maximumFractionDigits={4}
                        logoWidth={7}
                      />
                    </div>
                  </div>
                )}
                {data.token.floorSellValue && (
                  <div className="flex items-center gap-2 rounded-md bg-blue-100 px-2 py-0.5 text-blue-900">
                    <span className="whitespace-nowrap">List Price</span>
                    <div className="font-semibold">
                      <FormatEth
                        amount={data.token.floorSellValue}
                        maximumFractionDigits={4}
                        logoWidth={7}
                      />
                    </div>
                  </div>
                )}
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
                      Price (wETH)
                    </label>
                    <input
                      placeholder="Insert price"
                      id="price"
                      type="number"
                      min={0}
                      step={0.01}
                      value={offerPrice}
                      onChange={(e) => setOfferPrice(e.target.value)}
                      className="input-blue-outline w-[120px]"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <label
                      htmlFor="postOpenSea"
                      className="font-medium uppercase opacity-75"
                    >
                      Also post to Open Sea
                    </label>
                    <input
                      type="checkbox"
                      name="postOpenSea"
                      id="postOpenSea"
                      className="scale-125 transform"
                      checked={postOnOpenSea}
                      onChange={(e) => setPostOnOpenSea(e.target.checked)}
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
                      Total Cost
                    </div>
                    <div className="text-2xl font-bold">
                      <FormatEth
                        amount={calculations.total}
                        maximumFractionDigits={4}
                        logoWidth={10}
                      />
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
                    disabled={
                      +offerPrice <= 0 ||
                      !calculations.missingEth.isZero() ||
                      waitingTx
                    }
                    onClick={async () => {
                      const expirationValue = expirationPresets
                        .find(({ preset }) => preset === expiration)
                        ?.value()

                      const fee = royalties?.bps?.toString()
                      const contract = data.token.contract
                      const tokenId = data.token.id

                      if (
                        !signer ||
                        !expirationValue ||
                        !fee ||
                        !contract ||
                        !tokenId
                      ) {
                        console.debug({
                          signer,
                          expirationValue,
                          fee,
                          contract,
                          tokenId,
                          env,
                        })
                        return
                      }

                      // Wait for transactions to complete
                      try {
                        const url = new URL('/execute/bid', env.apiBase)

                        let query: paths['/execute/bid']['get']['parameters']['query'] =
                          {
                            maker: await signer.getAddress(),
                            price: calculations.total.toString(),
                            expirationTime: expirationValue,
                            contract,
                            tokenId,
                          }

                        setParams(url, query)
                        setWaitingTx(true)

                        await executeSteps(url, signer, (execute) =>
                          setSteps(execute.steps)
                        )

                        // Close modal
                        // closeButton.current?.click()
                        details.mutate()
                        setSuccess(true)
                      } catch (err) {
                        console.error(err)
                      }

                      setWaitingTx(false)
                      setSteps(undefined)
                    }}
                    className="btn-blue-fill w-full"
                  >
                    {waitingTx ? 'Waiting...' : 'Make Offer'}
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

export default TokenOfferModal
