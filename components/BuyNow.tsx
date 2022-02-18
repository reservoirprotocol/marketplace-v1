import { Signer } from 'ethers'
import { paths } from 'interfaces/apiTypes'
import executeSteps, { Execute } from 'lib/executeSteps'
import setParams from 'lib/params'
import React, { ComponentProps, FC, useRef, useState } from 'react'
import { SWRResponse } from 'swr'
import * as Dialog from '@radix-ui/react-dialog'
import { HiX } from 'react-icons/hi'
import StepsModalHeader from './StepsModalHeader'
import Steps from './Steps'

type Props = {
  isInTheWrongNetwork: boolean | undefined
  details: SWRResponse<
    paths['/tokens/details']['get']['responses']['200']['schema'],
    any
  >
  data: ComponentProps<typeof StepsModalHeader>['data']
  apiBase: string
  signer: Signer | undefined
  setError: React.Dispatch<React.SetStateAction<boolean>>
  show: boolean
}

const BuyNow: FC<Props> = ({
  isInTheWrongNetwork,
  details,
  apiBase,
  data,
  signer,
  setError,
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
            const tokenId = token?.token?.tokenId
            const contract = token?.token?.contract

            if (!signer || !tokenId || !contract) {
              console.debug({ tokenId, signer, contract })
              return
            }

            try {
              const url = new URL('/execute/buy', apiBase)

              const query: paths['/execute/buy']['get']['parameters']['query'] =
                {
                  contract,
                  tokenId,
                  taker: await signer.getAddress(),
                }
              setParams(url, query)
              setWaitingTx(true)

              await executeSteps(url, signer, setSteps)
              details.mutate()
            } catch (err: any) {
              // Handle user rejection
              if (err?.code === 4001) {
                // close modal
                setOpen(false)
                setSteps(undefined)
              }
              console.error(err)
              if (err?.message === 'Not enough ETH balance') setError(true)
            }
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
            <Dialog.Content className="fixed inset-0 bg-[#000000b6]">
              <div className="fixed top-1/2 left-1/2 w-[330px] max-w-prose -translate-x-1/2 -translate-y-1/2 transform rounded-md bg-white p-6 shadow-md ">
                <div className="mb-5 flex items-center justify-between">
                  <Dialog.Title className="text-lg font-medium uppercase opacity-75">
                    Buy now
                  </Dialog.Title>
                  <Dialog.Close className="btn-neutral-ghost ml-auto p-1.5">
                    <HiX className="h-5 w-5" />
                  </Dialog.Close>
                </div>
                <StepsModalHeader data={data} />
                <Steps steps={steps} />
                {steps?.[steps.length - 1].status === 'complete' && (
                  <Dialog.Close className="btn-green-fill w-full">
                    Success, Close this menu
                  </Dialog.Close>
                )}
              </div>
            </Dialog.Content>
          </Dialog.Overlay>
        </Dialog.Portal>
      )}
    </Dialog.Root>
  )
}

export default BuyNow
