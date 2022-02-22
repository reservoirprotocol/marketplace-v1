import { Signer } from 'ethers'
import { paths } from 'interfaces/apiTypes'
import { Execute } from 'lib/executeSteps'
import React, { ComponentProps, FC, useState } from 'react'
import { SWRResponse } from 'swr'
import * as Dialog from '@radix-ui/react-dialog'
import ModalCard from './modal/ModalCard'
import acceptOffer from 'lib/actions/acceptOffer'

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
}

const AcceptOffer: FC<Props> = ({
  isInTheWrongNetwork,
  details,
  apiBase,
  data,
  signer,
  show,
}) => {
  const [waitingTx, setWaitingTx] = useState<boolean>(false)
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
            setWaitingTx(true)
            await acceptOffer({
              apiBase,
              tokenId: token?.token?.tokenId,
              contract: token?.token?.contract,
              setSteps,
              signer,
              handleSuccess: () => details.mutate(),
              handleUserRejection: () => {
                setOpen(false)
                setSteps(undefined)
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
