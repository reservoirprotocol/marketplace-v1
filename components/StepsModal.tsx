import { FC, useEffect, useRef, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Execute } from 'lib/executeSteps'
import { HiX } from 'react-icons/hi'
import Steps from './Steps'
import { optimizeImage } from 'lib/optmizeImage'
import FormatEth from './FormatEth'

type Props = {
  steps: Execute['steps']
  title: string
  data: {
    token: {
      image: string | undefined
      name: string | undefined
      id: string | undefined
      contract: string | undefined
      topBuyValue: number | undefined
      floorSellValue: number | undefined
    }
    collection: {
      name: string | undefined
    }
  }
}

const StepsModal: FC<Props> = ({ steps, data, title }) => {
  const trigger = useRef<HTMLButtonElement>(null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!isOpen && steps) {
      trigger.current?.click()
    }
    if (isOpen && !steps) {
      trigger.current?.click()
    }
  }, [steps])

  return (
    <Dialog.Root onOpenChange={(open) => setIsOpen(open)}>
      <Dialog.Trigger className="hidden" ref={trigger} />
      <Dialog.Portal>
        <Dialog.Overlay>
          <Dialog.Content className="fixed inset-0 bg-[#000000b6]">
            <div className="fixed top-1/2 left-1/2 w-[330px] max-w-prose -translate-x-1/2 -translate-y-1/2 transform rounded-md bg-white p-6 shadow-md ">
              <div className="mb-5 flex items-center justify-between">
                <Dialog.Title className="text-lg font-medium uppercase opacity-75">
                  {title}
                </Dialog.Title>
                <Dialog.Close asChild>
                  <button className="btn-neutral-ghost ml-auto p-1.5">
                    <HiX className="h-5 w-5" />
                  </button>
                </Dialog.Close>
              </div>
              {data && (
                <>
                  <div className="mb-3 flex items-center gap-4">
                    <img
                      src={optimizeImage(data.token.image, 50)}
                      alt=""
                      className="w-[50px]"
                    />
                    <div className="overflow-auto">
                      <div className="text-sm">{data.collection.name}</div>
                      <div className="my-1.5 text-lg font-medium">
                        {data.token.name}
                      </div>
                      <div className="mb-1.5 text-sm">1 Eligible Token</div>
                    </div>
                  </div>
                  <div className="mb-5 flex flex-wrap items-stretch gap-1.5 text-sm">
                    {data.token.topBuyValue && (
                      <div className="flex items-center gap-2 rounded-md bg-blue-100 px-2 py-0.5 text-blue-900">
                        <span className="whitespace-nowrap">
                          Current Top Offer
                        </span>
                        <div className="font-semibold">
                          <FormatEth
                            amount={data.token.topBuyValue}
                            maximumFractionDigits={4}
                            logoWidth={7}
                          />
                        </div>
                      </div>
                    )}
                    {data.token.floorSellValue && (
                      <div className="flex items-center gap-2 rounded-md bg-blue-100 px-2 py-0.5 text-blue-900">
                        <span className="whitespace-nowrap">List Price</span>
                        <div className="font-semibold">
                          <FormatEth
                            amount={data.token.floorSellValue}
                            maximumFractionDigits={4}
                            logoWidth={7}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              <Steps steps={steps} />
              {isOpen && steps?.[steps.length - 1].status === 'complete' && (
                <Dialog.Close className="btn-green-fill w-full">
                  Success, Close this menu
                </Dialog.Close>
              )}
            </div>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default StepsModal
