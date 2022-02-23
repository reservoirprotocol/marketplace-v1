import { Signer } from 'ethers'
import { paths } from 'interfaces/apiTypes'
import { Execute } from 'lib/executeSteps'
import React, { ComponentProps, FC, useState } from 'react'
import { SWRResponse } from 'swr'
import * as Dialog from '@radix-ui/react-dialog'
import ModalCard from './modal/ModalCard'
import buyToken from 'lib/actions/buyToken'
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
  setToast: (data: ComponentProps<typeof Toast>['data']) => any
  show: boolean
}

const BuyNow: FC<Props> = ({
  isInTheWrongNetwork,
  details,
  apiBase,
  data,
  signer,
  setToast,
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
            !signer ||
            token?.market?.floorSell?.value === null ||
            waitingTx ||
            isInTheWrongNetwork
          }
          onClick={async () => {
            setWaitingTx(true)
            await buyToken({
              tokenId: token?.token?.tokenId,
              contract: token?.token?.contract,
              signer,
              apiBase,
              setSteps,
              handleSuccess: () => details.mutate(),
              handleUserRejection: () => {
                setOpen(false)
                setSteps(undefined)
              },
              handleError: (err: any) => {
                if (err?.message === 'Not enough ETH balance')
                  setToast({
                    kind: 'error',
                    message: 'You have insufficient funds to buy this token.',
                    title: 'Not enough ETH balance',
                  })
              },
            })
            setWaitingTx(false)
          }}
          className="btn-neutral-fill-dark w-full"
        >
          {waitingTx ? 'Waiting...' : 'Buy now'}
        </Dialog.Trigger>
      )}
      {steps && (
        <Dialog.Portal>
          <Dialog.Overlay>
            <ModalCard title="Buy now" data={data} steps={steps} />
          </Dialog.Overlay>
        </Dialog.Portal>
      )}
    </Dialog.Root>
  )
}

export default BuyNow
