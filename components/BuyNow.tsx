import {
  Execute,
  paths,
  ReservoirSDK,
  ReservoirSDKActions,
} from '@reservoir0x/client-sdk'
import React, {
  ComponentProps,
  FC,
  useContext,
  useEffect,
  useState,
} from 'react'
import { SWRResponse } from 'swr'
import * as Dialog from '@radix-ui/react-dialog'
import ModalCard from './modal/ModalCard'
import Toast from './Toast'
import { useSigner } from 'wagmi'
import { SWRInfiniteResponse } from 'swr/infinite/dist/infinite'
import { getDetails } from 'lib/fetch/fetch'
import { CgSpinner } from 'react-icons/cg'
import { GlobalContext } from 'context/GlobalState'

type Details = paths['/tokens/details/v4']['get']['responses']['200']['schema']
type Collection = paths['/collection/v2']['get']['responses']['200']['schema']

type Props = {
  data:
    | {
        details: SWRResponse<Details, any>
        collection: Collection | undefined
      }
    | {
        collectionId: string | undefined
        contract: string | undefined
        tokenId: string | undefined
      }
  isInTheWrongNetwork: boolean | undefined
  mutate?: SWRResponse['mutate'] | SWRInfiniteResponse['mutate']
  setToast: (data: ComponentProps<typeof Toast>['data']) => any
  show: boolean
  signer: ReturnType<typeof useSigner>['data']
}

const BuyNow: FC<Props> = ({
  data,
  isInTheWrongNetwork,
  mutate,
  setToast,
  show,
  signer,
}) => {
  const [waitingTx, setWaitingTx] = useState<boolean>(false)
  const [steps, setSteps] = useState<Execute['steps']>()
  const [open, setOpen] = useState(false)
  // Data from props
  const [details, setDetails] = useState<SWRResponse<Details, any> | Details>()
  const { dispatch } = useContext(GlobalContext)

  useEffect(() => {
    if (data) {
      // Load data if missing
      if ('tokenId' in data) {
        const { contract, tokenId, collectionId } = data

        getDetails(contract, tokenId, setDetails)
      }
      // Load data if provided
      if ('details' in data) {
        const { details, collection } = data

        setDetails(details)
      }
    }
  }, [data])

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

  type TokenData = Parameters<ReservoirSDKActions['buyToken']>['0']['tokens'][0]

  const execute = async (token: TokenData, expectedPrice: number) => {
    setWaitingTx(true)
    if (!signer) {
      throw 'Missing a signer'
    }

    await ReservoirSDK.client()
      .actions.buyToken({
        expectedPrice,
        tokens: [token],
        signer,
        onProgress: setSteps,
      })
      .then(() => {
        details && 'mutate' in details && details.mutate()
        mutate && mutate()
      })
      .catch((err) => {
        if (err?.type === 'price mismatch') {
          setToast({
            kind: 'error',
            message: 'Price was greater than expected.',
            title: 'Could not buy token',
          })
          return
        }

        if (err?.message === 'Not enough ETH balance') {
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

    setWaitingTx(false)
  }

  const expectedPrice = token?.market?.floorAsk?.price

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      {show && (
        <Dialog.Trigger
          disabled={
            token?.market?.floorAsk?.price === null ||
            waitingTx ||
            isInTheWrongNetwork
          }
          onClick={() => {
            if (!signer || !token.token || !expectedPrice) {
              dispatch({ type: 'CONNECT_WALLET', payload: true })
              return
            }

            execute(token.token, expectedPrice)
          }}
        >
          {waitingTx ? (
            <p className="btn-primary-fill w-full">
              <CgSpinner className="h-4 w-4 animate-spin" />
            </p>
          ) : (
            <p className="btn-primary-fill w-full">Buy Now</p>
          )}
        </Dialog.Trigger>
      )}
      {steps && (
        <Dialog.Portal>
          <Dialog.Overlay>
            <ModalCard title="Buy Now" loading={waitingTx} steps={steps} />
          </Dialog.Overlay>
        </Dialog.Portal>
      )}
    </Dialog.Root>
  )
}

export default BuyNow
