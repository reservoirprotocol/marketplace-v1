import { Signer } from 'ethers'
import { paths } from 'interfaces/apiTypes'
import { Execute } from 'lib/executeSteps'
import React, { ComponentProps, FC, useState } from 'react'
import { SWRResponse } from 'swr'
import * as Dialog from '@radix-ui/react-dialog'
import ModalCard from './modal/ModalCard'
import acceptOffer from 'lib/actions/acceptOffer'
import { useConnect } from 'wagmi'
import Toast from './Toast'

type Props = {
  isInTheWrongNetwork: boolean | undefined
  details: SWRResponse<
    paths['/tokens/details']['get']['responses']['200']['schema'],
    any
  >
  data: ComponentProps<typeof ModalCard>['data']
  apiBase: string
  signer: Signer | undefined
  show: boolean
  setToast: (data: ComponentProps<typeof Toast>['data']) => any
}

const AcceptOffer: FC<Props> = ({
  isInTheWrongNetwork,
  details,
  apiBase,
  data,
  signer,
  show,
  setToast,
}) => {
  const [waitingTx, setWaitingTx] = useState<boolean>(false)
  const [{ data: connectData }, connect] = useConnect()
  const [steps, setSteps] = useState<Execute['steps']>()
  const [open, setOpen] = useState(false)

  const token = details.data?.tokens?.[0]

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      {show && (
        <Dialog.Trigger
          disabled={
            waitingTx || !token?.market?.topBuy?.value || isInTheWrongNetwork
          }
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
              tokenId: token?.token?.tokenId,
              contract: token?.token?.contract,
              setSteps,
              signer,
              handleSuccess: () => details.mutate(),
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
            <ModalCard title="Accept offer" data={data} steps={steps} />
          </Dialog.Overlay>
        </Dialog.Portal>
      )}
    </Dialog.Root>
  )
}

export default AcceptOffer
