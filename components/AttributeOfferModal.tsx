import { ComponentProps, FC, useEffect, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import ExpirationSelector from './ExpirationSelector'
import { BigNumber, constants, ethers } from 'ethers'
import {
  useBalance,
  useConnect,
  useNetwork,
  useProvider,
  useSigner,
} from 'wagmi'
import calculateOffer from 'lib/calculateOffer'
import FormatEth from './FormatEth'
import expirationPresets from 'lib/offerExpirationPresets'
import useCollectionStats from 'hooks/useCollectionStats'
import { Common } from '@reservoir0x/sdk'
import getWeth from 'lib/getWeth'
import useTokens from 'hooks/useTokens'
import { Execute } from 'lib/executeSteps'
import ModalCard from './modal/ModalCard'
import placeBid from 'lib/actions/placeBid'
import Toast from './Toast'
import { CgSpinner } from 'react-icons/cg'

type Props = {
  env: {
    apiBase: string
    chainId: ChainId
    openSeaApiKey: string | undefined
  }
  data: {
    collection: {
      id: string | undefined
      image: string | undefined
      name: string | undefined
      tokenCount: number
    }
    attribute: {
      key: string | undefined
      value: string | undefined
    }
  }
  royalties: {
    bps: number | undefined
    recipient: string | undefined
  }
  signer: ethers.Signer | undefined
  stats: ReturnType<typeof useCollectionStats>
  tokens: ReturnType<typeof useTokens>['tokens']
  setToast: (data: ComponentProps<typeof Toast>['data']) => any
}

const AttributeOfferModal: FC<Props> = ({
  env,
  royalties,
  stats,
  data,
  tokens,
  setToast,
}) => {
  const [expiration, setExpiration] = useState<string>('oneDay')
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
  const [{ data: connectData }, connect] = useConnect()
  const provider = useProvider()
  const bps = royalties?.bps ?? 0
  const royaltyPercentage = `${bps / 100}%`
  const [open, setOpen] = useState(false)
  const isInTheWrongNetwork = signer && network.chain?.id !== env.chainId

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

  const handleError: Parameters<typeof placeBid>[0]['handleError'] = (err) => {
    // Handle user rejection
    if (err?.code === 4001) {
      setOpen(false)
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
      title: 'Could not place bid',
    })
  }

  const handleSuccess: Parameters<typeof placeBid>[0]['handleSuccess'] = () => {
    stats.mutate()
    tokens.mutate()
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

    if (!signer) return

    await placeBid({
      query: {
        maker: await signer.getAddress(),
        price: calculations.total.toString(),
        expirationTime: expirationValue,
        attributeKey: data.attribute.key,
        attributeValue: data.attribute.value,
        collection: data.collection.id,
      },
      signer,
      apiBase: env.apiBase,
      setSteps,
      handleSuccess,
      handleError,
    })
    setWaitingTx(false)
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        disabled={isInTheWrongNetwork}
        onClick={async () => await checkWallet()}
        className="btn-primary-outline"
      >
        Maker an Attribute Offer
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay>
          <ModalCard
            loading={waitingTx}
            title="Maker an Attribute Offer"
            onCloseCallback={() => setSteps(undefined)}
            steps={steps}
            actionButton={
              <button
                disabled={
                  +offerPrice <= 0 ||
                  !calculations.missingEth.isZero() ||
                  waitingTx
                }
                onClick={execute}
                className="btn-primary-fill w-full"
              >
                {waitingTx ? (
                  <CgSpinner className="h-4 w-4 animate-spin" />
                ) : (
                  'Make Offer'
                )}
              </button>
            }
          >
            <>
              <div className="mb-8 space-y-5">
                <div className="flex items-center justify-between">
                  <label htmlFor="price" className="reservoir-h6">
                    Price (wETH)
                  </label>
                  <input
                    placeholder="Amount"
                    id="price"
                    type="number"
                    min={0}
                    step={0.01}
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(e.target.value)}
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
                <div className="flex justify-between">
                  <div className="reservoir-h6">Fees</div>
                  <div className="reservoir-body text-right">
                    <div>Royalty {royaltyPercentage}</div>
                  </div>
                </div>
                <div className="flex justify-between">
                  <div className="reservoir-h6">Total Cost</div>
                  <div className="reservoir-h6 font-bold">
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
            </>
          </ModalCard>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default AttributeOfferModal
