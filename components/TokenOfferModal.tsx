import { FC, useEffect, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import ExpirationSelector from './ExpirationSelector'
import { BigNumber, constants, ethers } from 'ethers'
import { useBalance, useNetwork, useProvider, useSigner } from 'wagmi'
import calculateOffer from 'lib/calculateOffer'
import { SWRResponse } from 'swr'
import FormatEth from './FormatEth'
import expirationPresets from 'lib/offerExpirationPresets'
import { paths } from 'interfaces/apiTypes'
import { Common } from '@reservoir0x/sdk'
import getWeth from 'lib/getWeth'
import executeSteps, { Execute } from 'lib/executeSteps'
import setParams from 'lib/params'
import ModalCard from './modal/ModalCard'
import placeBid from 'lib/actions/placeBid'

type Props = {
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

const TokenOfferModal: FC<Props> = ({ env, royalties, details, data }) => {
  const [expiration, setExpiration] = useState<string>('oneDay')
  const [postOnOpenSea, setPostOnOpenSea] = useState<boolean>(false)
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
  const provider = useProvider()
  const bps = royalties?.bps ?? 0
  const royaltyPercentage = `${bps / 100}%`
  const [open, setOpen] = useState(false)
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
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        disabled={!signer || isInTheWrongNetwork}
        className="btn-neutral-outline w-full border-neutral-900"
      >
        Make Offer
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay>
          <ModalCard
            title="Make a token offer"
            data={data}
            steps={steps}
            onCloseCallback={() => setSteps(undefined)}
            actionButton={
              <button
                disabled={
                  +offerPrice <= 0 ||
                  !calculations.missingEth.isZero() ||
                  waitingTx
                }
                onClick={async () => {
                  setWaitingTx(true)

                  const expirationValue = expirationPresets
                    .find(({ preset }) => preset === expiration)
                    ?.value()

                  if (!signer) return

                  await placeBid({
                    query: {
                      maker: await signer.getAddress(),
                      price: calculations.total.toString(),
                      expirationTime: expirationValue,
                      contract: data.token.contract,
                      tokenId: data.token.id,
                    },
                    signer,
                    apiBase: env.apiBase,
                    setSteps,
                    handleSuccess: () => details.mutate(),
                    handleUserRejection: () => {
                      setOpen(false)
                      setSteps(undefined)
                    },
                  })
                  setWaitingTx(false)
                }}
                className="btn-blue-fill w-full"
              >
                {waitingTx ? 'Waiting...' : 'Make Offer'}
              </button>
            }
          >
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
              <div className="hidden items-center gap-3">
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
          </ModalCard>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default TokenOfferModal
