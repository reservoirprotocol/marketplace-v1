import { Signer } from 'ethers'
import { acceptOffer, Execute, paths } from '@reservoir0x/client-sdk'
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
import { useAccount, useConnect, useSigner } from 'wagmi'
import Toast from './Toast'
import { SWRInfiniteResponse } from 'swr/infinite/dist/infinite'
import { getDetails } from 'lib/fetch/fetch'
import { CgSpinner } from 'react-icons/cg'
import { GlobalContext } from 'context/GlobalState'

const RESERVOIR_API_BASE = process.env.NEXT_PUBLIC_RESERVOIR_API_BASE

type Details = paths['/tokens/details/v4']['get']['responses']['200']['schema']
type Collection = paths['/collection/v2']['get']['responses']['200']['schema']

type Props = {
  data:
    | {
        details: SWRResponse<Details, any>
        collection: Collection | undefined
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
  const { connect, connectors } = useConnect()
  const { data: accountData } = useAccount()
  const [steps, setSteps] = useState<Execute['steps']>()
  const [open, setOpen] = useState(false)
  const { dispatch } = useContext(GlobalContext)

  // Data from props
  const [collection, setCollection] = useState<Collection>()
  const [details, setDetails] = useState<SWRResponse<Details, any> | Details>()

  useEffect(() => {
    if (data && open) {
      // Load data if missing
      if ('tokenId' in data) {
        getDetails(data.contract, data.tokenId, setDetails)
      }
      // Load data if provided
      if ('details' in data) {
        setDetails(data.details)
        setCollection(data.collection)
      }
    }
  }, [data, open])

  let tokenId: string | undefined = undefined
  let contract: string | undefined = undefined

  if ('tokenId' in data) {
    tokenId = data.tokenId
    contract = data.contract
  }

  if ('details' in data) {
    tokenId = data.details.data?.tokens?.[0].token?.tokenId
    contract = data.details.data?.tokens?.[0].token?.contract
  }

  // Set the token either from SWR or fetch
  let token: NonNullable<Details['tokens']>[0] = { token: undefined }

  let topBuyValueExists = false

  // From fetch
  if (details && 'tokens' in details && details.tokens?.[0]) {
    token = details.tokens?.[0]
  }

  // From SWR
  if (details && 'data' in details && details?.data?.tokens?.[0]) {
    token = details.data?.tokens?.[0]
    topBuyValueExists = !token?.market?.topBid?.value
  }

  const modalData = {
    collection: {
      name: collection?.collection?.name,
    },
    token: {
      contract: token?.token?.contract,
      id: token?.token?.tokenId,
      image: token?.token?.image,
      name: token?.token?.name,
      topBuyValue: token?.market?.topBid?.value,
      floorSellValue: token?.market?.floorAsk?.price,
    },
  }

  const handleError: Parameters<typeof acceptOffer>[0]['handleError'] = (
    err
  ) => {
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

  const handleSuccess: Parameters<
    typeof acceptOffer
  >[0]['handleSuccess'] = () => {
    details && 'mutate' in details && details.mutate()
    mutate && mutate()
  }

  let tokenString: string | undefined = undefined

  if (contract && tokenId) {
    tokenString = `${contract}:${tokenId}`
  }
  if (token?.token?.contract && token?.token?.tokenId) {
    tokenString = `${token?.token?.contract}:${token?.token?.tokenId}`
  }

  const expectedPrice = token?.market?.topBid?.value

  const execute = async (token: string, taker: string) => {
    setWaitingTx(true)
    await acceptOffer({
      expectedPrice,
      apiBase: RESERVOIR_API_BASE,
      query: {
        token,
        taker,
      },
      setState: setSteps,
      signer,
      handleSuccess,
      handleError,
    })
    setWaitingTx(false)
  }

  const taker = accountData?.address

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      {show && (
        <Dialog.Trigger
          disabled={waitingTx || topBuyValueExists || isInTheWrongNetwork}
          onClick={() => {
            if (!taker || !tokenString) {
              dispatch({ type: 'CONNECT_WALLET', payload: true })
              return
            }

            execute(tokenString, taker)
          }}
          //className="btn-primary-outline w-full dark:text-white"
        >
          {children ? (
            children
          ) : (
            <button className="btn-primary-outline w-full dark:text-white">
              {waitingTx ? (
                <CgSpinner className="h-4 w-4 animate-spin" />
              ) : (
                'Accept Offer'
              )}
            </button>
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
