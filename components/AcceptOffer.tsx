import { Signer } from 'ethers'
import { paths } from 'interfaces/apiTypes'
import { Execute } from 'lib/executeSteps'
import React, { ComponentProps, FC, useEffect, useState } from 'react'
import { SWRResponse } from 'swr'
import * as Dialog from '@radix-ui/react-dialog'
import ModalCard from './modal/ModalCard'
import acceptOffer from 'lib/actions/acceptOffer'
import { useConnect } from 'wagmi'
import Toast from './Toast'
import { SWRInfiniteResponse } from 'swr/infinite/dist/infinite'
import { getDetails } from 'lib/fetch/fetch'

type Details = paths['/tokens/details']['get']['responses']['200']['schema']
type Collection =
  paths['/collections/{collection}']['get']['responses']['200']['schema']

type Props = {
  apiBase: string
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
  signer: Signer | undefined
}

const AcceptOffer: FC<Props> = ({
  isInTheWrongNetwork,
  apiBase,
  mutate,
  data,
  signer,
  show,
  setToast,
}) => {
  const [waitingTx, setWaitingTx] = useState<boolean>(false)
  const [{ data: connectData }, connect] = useConnect()
  const [steps, setSteps] = useState<Execute['steps']>()
  const [open, setOpen] = useState(false)

  // Data from props
  const [collection, setCollection] = useState<Collection>()
  const [details, setDetails] = useState<SWRResponse<Details, any> | Details>()

  useEffect(() => {
    if (data && open) {
      // Load data if missing
      if ('tokenId' in data) {
        getDetails(apiBase, data.contract, data.tokenId, setDetails)
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
    topBuyValueExists = !token?.market?.topBuy?.value
  }

  const modalData = {
    collection: {
      name: collection?.collection?.collection?.name,
    },
    token: {
      contract: token?.token?.contract,
      id: token?.token?.tokenId,
      image: token?.token?.image,
      name: token?.token?.name,
      topBuyValue: token?.market?.topBuy?.value,
      floorSellValue: token?.market?.floorSell?.value,
    },
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      {show && (
        <Dialog.Trigger
          disabled={waitingTx || topBuyValueExists || isInTheWrongNetwork}
          onClick={async () => {
            if (!signer) {
              const data = await connect(connectData.connectors[0])
              if (data?.data) {
                setToast({
                  kind: 'success',
                  message: 'Connected your wallet successfully.',
                  title: 'Wallet connected',
                })
              }
              return
            }

            setWaitingTx(true)
            await acceptOffer({
              apiBase,
              tokenId: tokenId || token?.token?.tokenId,
              contract: contract || token?.token?.contract,
              setSteps,
              signer,
              handleSuccess: () => {
                details && 'mutate' in details && details.mutate()
                mutate && mutate()
              },
              handleError: (err) => {
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
                  title: 'Could not accept offer',
                })
              },
            })
            setWaitingTx(false)
          }}
          className="btn-neutral-outline w-full border-neutral-900"
        >
          {waitingTx ? 'Waiting...' : 'Accept offer'}
        </Dialog.Trigger>
      )}
      {steps && (
        <Dialog.Portal>
          <Dialog.Overlay>
            <ModalCard title="Accept offer" data={modalData} steps={steps} />
          </Dialog.Overlay>
        </Dialog.Portal>
      )}
    </Dialog.Root>
  )
}

export default AcceptOffer
