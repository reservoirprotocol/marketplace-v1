import { Execute, paths } from '@reservoir0x/reservoir-kit-client'
import React, {
  ComponentProps,
  FC,
  useContext,
  useEffect,
  useState,
} from 'react'
import { SWRResponse } from 'swr'
import * as Dialog from '@radix-ui/react-dialog'
import Toast from './Toast'
import { useAccount, useNetwork, useSigner } from 'wagmi'
import { SWRInfiniteResponse } from 'swr/infinite/dist/infinite'
import { GlobalContext } from 'context/GlobalState'
import { HiX } from 'react-icons/hi'
import { optimizeImage } from 'lib/optmizeImage'
import FormatNativeCrypto from './FormatNativeCrypto'
import AttributesFlex from './AttributesFlex'
import ModalCard from './modal/ModalCard'
import { styled } from '@stitches/react'
import { violet, blackA } from '@radix-ui/colors'
import * as SliderPrimitive from '@radix-ui/react-slider'
import Link from 'next/link'
import { Signer } from 'ethers'
import { FaBroom } from 'react-icons/fa'
import { useReservoirClient, useTokens } from '@reservoir0x/reservoir-kit-ui'
import { Collection } from 'types/reservoir'
import useCoinConversion from 'hooks/useCoinConversion'
import { formatDollar } from 'lib/numbers'

const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID
const DARK_MODE = process.env.NEXT_PUBLIC_DARK_MODE
const DISABLE_POWERED_BY_RESERVOIR =
  process.env.NEXT_PUBLIC_DISABLE_POWERED_BY_RESERVOIR
const API_BASE =
  process.env.NEXT_PUBLIC_RESERVOIR_API_BASE || 'https://api.reservoir.tools'

type UseTokensReturnType = ReturnType<typeof useTokens>

type Props = {
  tokens: UseTokensReturnType['data']
  collection?: Collection
  mutate?: SWRResponse['mutate'] | SWRInfiniteResponse['mutate']
  setToast: (data: ComponentProps<typeof Toast>['data']) => any
}

const StyledSlider = styled(SliderPrimitive.Root, {
  position: 'relative',
  alignItems: 'center',
  userSelect: 'none',
  touchAction: 'none',

  '&[data-orientation="horizontal"]': {
    height: 20,
  },

  '&[data-orientation="vertical"]': {
    flexDirection: 'column',
    width: 20,
    height: 100,
  },
})

const StyledTrack = styled(SliderPrimitive.Track, {
  position: 'relative',
  flexGrow: 1,
  borderRadius: '9999px',

  '&[data-orientation="horizontal"]': { height: 6 },
  '&[data-orientation="vertical"]': { width: 6 },
})

const StyledRange = styled(SliderPrimitive.Range, {
  position: 'absolute',
  borderRadius: '9999px',
  height: '100%',
})

const StyledThumb = styled(SliderPrimitive.Thumb, {
  all: 'unset',
  display: 'block',
  width: 20,
  height: 20,
  backgroundColor: 'white',
  boxShadow: `0 2px 10px ${blackA.blackA7}`,
  borderRadius: 10,
  cursor: 'pointer',
  '&:hover': { backgroundColor: violet.violet3 },
  '&:focus': { boxShadow: `0 0 0 5px ${blackA.blackA8}` },
})

const Sweep: FC<Props> = ({ tokens, collection, mutate, setToast }) => {
  const [waitingTx, setWaitingTx] = useState<boolean>(false)
  const accountData = useAccount()
  const { chain: activeChain } = useNetwork()
  const { data: signer } = useSigner()
  const [steps, setSteps] = useState<Execute['steps']>()
  const [sweepAmount, setSweepAmount] = useState<number>(1)
  const [maxInput, setMaxInput] = useState<number>(0)
  const [sweepTokens, setSweepTokens] = useState<
    NonNullable<UseTokensReturnType['data']>
  >([])
  const [sweepTotal, setSweepTotal] = useState<number>(0)
  const [open, setOpen] = useState(false)
  const [details, _setDetails] = useState<
    SWRResponse<UseTokensReturnType, any> | UseTokensReturnType['data']
  >()
  const { dispatch } = useContext(GlobalContext)
  const reservoirClient = useReservoirClient()

  const isInTheWrongNetwork = Boolean(
    signer && CHAIN_ID && activeChain?.id !== +CHAIN_ID
  )

  const usdConversion = useCoinConversion('usd', 'ETH')

  useEffect(() => {
    const availableTokens = tokens.filter(
      (token) =>
        token !== undefined &&
        token?.token !== undefined &&
        token?.market?.floorAsk?.price?.amount?.native !== undefined &&
        token?.market?.floorAsk?.price?.amount?.native !== null &&
        token?.market?.floorAsk?.price?.currency?.symbol === 'ETH' &&
        token?.token?.owner?.toLowerCase() !==
          accountData?.address?.toLowerCase() &&
        token?.market?.floorAsk?.source?.name != 'sudoswap'
    )
    setMaxInput(availableTokens.length)
    const sweepTokens = availableTokens.slice(0, sweepAmount)

    setSweepTokens(sweepTokens)

    const total = sweepTokens.reduce((total, token) => {
      if (token?.market?.floorAsk?.price?.amount?.native) {
        total += token.market.floorAsk.price.amount.native
      }
      return total
    }, 0)

    setSweepTotal(total)
  }, [sweepAmount, tokens])

  // Set the token either from SWR or fetch
  let token: UseTokensReturnType['data'][0] = { token: undefined }

  const fetchedDetails = details as UseTokensReturnType['data']
  if (fetchedDetails && fetchedDetails?.[0]) {
    // From fetch
    token = fetchedDetails[0]
  } else if (details && 'data' in details && details.data?.data) {
    // From swr
    token = details.data?.data[0]
  }

  const execute = async (signer: Signer) => {
    if (!signer) {
      throw 'Missing a signer'
    }

    if (!sweepTokens) {
      throw 'Missing tokens to sweep'
    }

    if (!reservoirClient) {
      throw 'reservoirClient is not initialized'
    }

    setWaitingTx(true)
    const tokens = sweepTokens.reduce((tokens, token) => {
      if (token?.token?.tokenId && token.token.contract) {
        tokens?.push({
          tokenId: token.token.tokenId,
          contract: token.token.contract,
        })
      }
      return tokens
    }, [] as NonNullable<Parameters<typeof reservoirClient.actions.buyToken>['0']['tokens']>)
    await reservoirClient.actions
      .buyToken({
        expectedPrice: sweepTotal,
        tokens: tokens,
        signer,
        onProgress: setSteps,
        options: {
          partial: true,
        },
      })
      .then(() => {
        setWaitingTx(false)
        details && 'mutate' in details && details.mutate()
        mutate && mutate()
      })
      .catch((err: any) => {
        setWaitingTx(false)
        if (err?.type === 'price mismatch') {
          setToast({
            kind: 'error',
            message: 'Price was greater than expected.',
            title: 'Could not buy token',
          })
          return
        }

        if (err?.message.includes('ETH balance')) {
          setToast({
            kind: 'error',
            message: 'You have insufficient funds to buy this token.',
            title: 'Not enough ETH balance',
          })
          return
        }
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
          title: 'Could not buy token',
        })
      })
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        disabled={
          token?.market?.floorAsk?.price === null ||
          waitingTx ||
          isInTheWrongNetwork ||
          sweepTokens?.length === 0
        }
        className="btn-primary-fill gap-2 dark:ring-primary-900 dark:focus:ring-4"
      >
        <FaBroom className="text-white" />
        Sweep
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay>
          {steps ? (
            <ModalCard title="Buy Now" loading={waitingTx} steps={steps} />
          ) : (
            <Dialog.Content className="fixed inset-0 z-[10000] bg-[#000000b6] px-8">
              <div className="fixed top-1/2 left-1/2 w-full -translate-x-1/2 -translate-y-1/2 transform">
                <div className="px-5">
                  <div
                    className={`mx-auto  border border-neutral-300 bg-white p-11 shadow-xl dark:border-neutral-600 dark:bg-black md:w-[639px] ${
                      DISABLE_POWERED_BY_RESERVOIR
                        ? 'rounded-2xl'
                        : 'rounded-t-2xl'
                    }`}
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <Dialog.Title className="reservoir-h4 font-headings dark:text-white">
                        <div className="flex items-center gap-4">
                          <img
                            src={collection?.image}
                            alt=""
                            className="block h-12 w-12 rounded-full"
                          />
                          <div className="reservoir-h5 dark:text-white">
                            {collection?.name}
                          </div>
                        </div>
                      </Dialog.Title>
                      <Dialog.Close className="btn-primary-outline p-1.5 dark:border-neutral-600 dark:text-white dark:ring-primary-900 dark:focus:ring-4">
                        <HiX className="h-5 w-5" />
                      </Dialog.Close>
                    </div>
                    <AttributesFlex className="mb-4 flex flex-wrap gap-3" />
                    <div className="mb-4 flex items-center gap-4">
                      <StyledSlider
                        defaultValue={[50]}
                        value={[sweepAmount]}
                        step={1}
                        onValueChange={(value) => setSweepAmount(value[0])}
                        name="amount"
                        id="amount"
                        min={1}
                        max={maxInput}
                        className="hidden w-full flex-grow md:flex"
                      >
                        <StyledTrack className="bg-neutral-200 dark:bg-neutral-700">
                          <StyledRange className="bg-primary-700" />
                        </StyledTrack>
                        <StyledThumb />
                      </StyledSlider>
                      <input
                        value={sweepAmount}
                        min={1}
                        max={maxInput}
                        step={1}
                        onChange={(e) => {
                          let amount = +e.target.value
                          if (amount > maxInput) {
                            amount = maxInput
                          }
                          setSweepAmount(amount)
                        }}
                        type="number"
                        name="amount"
                        id="amount"
                        className="input-primary-outline w-full px-2 dark:border-neutral-600 dark:bg-neutral-900 dark:ring-primary-900  dark:focus:ring-4 md:w-20"
                      />
                    </div>
                    <div className="mb-8 grid h-[215px] grid-cols-5 justify-center gap-2 overflow-y-auto pr-2 md:grid-cols-7">
                      {sweepTokens?.map((token) => (
                        <div className="relative" key={token?.token?.tokenId}>
                          <img
                            className="absolute top-1 right-1 h-4 w-4"
                            src={`${API_BASE}/redirect/sources/${token?.market?.floorAsk?.source?.domain}/logo/v2`}
                            alt={`${token?.token?.contract} icon`}
                          />
                          <img
                            src={optimizeImage(
                              token?.token?.image || collection?.image,
                              72
                            )}
                            className="mb-2 h-[72px] w-full rounded-lg object-cover"
                            alt={`${token?.token?.name} image`}
                          />
                          <div className="reservoir-subtitle text-center text-xs dark:text-white md:text-sm">
                            <FormatNativeCrypto
                              amount={
                                token?.market?.floorAsk?.price?.amount?.native
                              }
                              maximumFractionDigits={4}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mb-4 flex justify-between">
                      <div className="reservoir-h6 text-center dark:text-white">
                        Total Price
                      </div>
                      <div>
                        <div className="reservoir-h5 text-right dark:text-white">
                          <FormatNativeCrypto
                            amount={sweepTotal}
                            maximumFractionDigits={4}
                          />
                        </div>
                        {usdConversion && (
                          <div className="text-sm font-normal text-neutral-600 dark:text-neutral-300">
                            {formatDollar(usdConversion * sweepTotal)}
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      disabled={
                        token?.market?.floorAsk?.price === null ||
                        waitingTx ||
                        isInTheWrongNetwork ||
                        sweepTokens?.length === 0
                      }
                      onClick={async () => {
                        if (!signer) {
                          dispatch({ type: 'CONNECT_WALLET', payload: true })
                          return
                        }

                        await execute(signer)
                      }}
                      className="btn-primary-fill w-full dark:ring-primary-900 dark:focus:ring-4 md:mx-auto md:w-[248px]"
                    >
                      Buy Now
                    </button>
                  </div>
                  {!DISABLE_POWERED_BY_RESERVOIR && (
                    <div className="mx-auto flex items-center justify-center rounded-b-2xl bg-neutral-100 py-4 dark:bg-neutral-800 md:w-[639px]">
                      <Link href="https://reservoirprotocol.github.io/">
                        <a
                          className="reservoir-tiny flex gap-2 dark:text-white"
                          target="_blank"
                        >
                          Powered by{' '}
                          <img
                            alt="Reservoir Watermark"
                            src={
                              !!DARK_MODE
                                ? `/reservoir_watermark_dark.svg`
                                : `/reservoir_watermark_light.svg`
                            }
                          />
                        </a>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </Dialog.Content>
          )}
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default Sweep
