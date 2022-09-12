import {
  Execute,
  paths,
  ReservoirClientActions,
} from '@reservoir0x/reservoir-kit-client'
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
import { useSigner } from 'wagmi'
import Toast from './Toast'
import { SWRInfiniteResponse } from 'swr/infinite/dist/infinite'
import { getDetails } from 'lib/fetch/fetch'
import { CgSpinner } from 'react-icons/cg'
import { GlobalContext } from 'context/GlobalState'
import { useReservoirClient, useTokens } from '@reservoir0x/reservoir-kit-ui'

type UseTokensReturnType = ReturnType<typeof useTokens>

type Props = {
  data:
    | {
        details: UseTokensReturnType['data']
      }
    | {
        contract: string | undefined
        tokenId: string | undefined
      }
  isInTheWrongNetwork: boolean | undefined
  mutate?: SWRResponse['mutate'] | SWRInfiniteResponse['mutate']
  setToast: (data: ComponentProps<typeof Toast>['data']) => any
  show: boolean
  signer: ReturnType<typeof useSigner>['data']
}

const AcceptOffer: FC<Props> = ({
  isInTheWrongNetwork,
  mutate,
  data,
  children,
  signer,
  show,
  setToast,
}) => {
  const [waitingTx, setWaitingTx] = useState<boolean>(false)
  const [steps, setSteps] = useState<Execute['steps']>()
  const [open, setOpen] = useState(false)
  const { dispatch } = useContext(GlobalContext)

  const [details, setDetails] = useState<
    SWRResponse<UseTokensReturnType, any> | UseTokensReturnType['data']
  >()
  const reservoirClient = useReservoirClient()

  useEffect(() => {
    if (data && open && !details) {
      // Load data if missing
      if ('tokenId' in data) {
        getDetails(data.contract, data.tokenId, (data) => {
          setDetails(data['tokens'])
        })
      }
      // Load data if provided
      if ('details' in data) {
        setDetails(data.details)
      }
    }
  }, [data, open, details])

  let tokenId: string | undefined = undefined
  let contract: string | undefined = undefined

  if ('tokenId' in data) {
    tokenId = data.tokenId
    contract = data.contract
  }

  if ('details' in data) {
    tokenId = data.details?.[0]?.token?.tokenId
    contract = data.details?.[0]?.token?.contract
  }

  // Set the token either from SWR or fetch
  let token: NonNullable<UseTokensReturnType['data']>[0] = { token: undefined }

  let topBuyValueExists = false

  const fetchedDetails = details as UseTokensReturnType['data']
  if (fetchedDetails && fetchedDetails[0]) {
    // From fetch
    token = fetchedDetails[0]
  } else if (details && 'data' in details && details.data?.data?.[0]) {
    // From SWR
    token = details.data.data[0]
    topBuyValueExists = !token?.market?.topBid?.price?.amount?.decimal
  }

  const handleError = (err: any) => {
    setWaitingTx(false)
    setOpen(false)
    setSteps(undefined)
    if (err?.type === 'price mismatch') {
      setToast({
        kind: 'error',
        message: 'Offer was lower than expected.',
        title: 'Could not accept offer',
      })
      return
    }
    // Handle user rejection
    if (err?.code === 4001) {
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
      title: 'Could not accept offer',
    })
  }

  const handleSuccess = () => {
    setWaitingTx(false)
    details && 'mutate' in details && details.mutate()
    mutate && mutate()
  }

  let acceptOfferToken:
    | Parameters<ReservoirClientActions['acceptOffer']>['0']['token']
    | undefined = undefined

  if (contract && tokenId) {
    acceptOfferToken = {
      contract,
      tokenId: tokenId,
    }
  }

  if (token?.token?.contract && token?.token?.tokenId) {
    acceptOfferToken = {
      contract: token.token.contract,
      tokenId: token.token.tokenId,
    }
  }

  const expectedPrice = token?.market?.topBid?.price?.amount?.decimal

  const execute = async (
    token: Parameters<ReservoirClientActions['acceptOffer']>['0']['token']
  ) => {
    if (!signer) {
      throw 'Missing a signer'
    }

    if (!reservoirClient) {
      throw 'reservoirClient is not initialized'
    }

    setWaitingTx(true)

    reservoirClient.actions
      .acceptOffer({
        signer,
        expectedPrice,
        token,
        onProgress: setSteps,
      })
      .then(handleSuccess)
      .catch(handleError)
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      {show && (
        <Dialog.Trigger
          disabled={waitingTx || topBuyValueExists || isInTheWrongNetwork}
          onClick={() => {
            if (!acceptOfferToken || !signer) {
              dispatch({ type: 'CONNECT_WALLET', payload: true })
              return
            }

            execute(acceptOfferToken)
          }}
        >
          {children ? (
            children
          ) : waitingTx ? (
            <p className="btn-primary-outline w-full dark:text-white">
              <CgSpinner className="h-4 w-4 animate-spin" />
            </p>
          ) : (
            <p className="btn-primary-outline w-full dark:text-white">
              Accept Offer
            </p>
          )}
        </Dialog.Trigger>
      )}
      {steps && (
        <Dialog.Portal>
          <Dialog.Overlay>
            <ModalCard title="Accept Offer" loading={waitingTx} steps={steps} />
          </Dialog.Overlay>
        </Dialog.Portal>
      )}
    </Dialog.Root>
  )
}

export default AcceptOffer
