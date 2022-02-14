import { FC, useEffect, useRef, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import Link from 'next/link'
import { Execute } from 'lib/executeSteps'
import { HiX } from 'react-icons/hi'
import Steps from './Steps'

type Props = {
  steps: Execute['steps']
}

const StepsModal: FC<Props> = ({ steps }) => {
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
      <Dialog.Trigger ref={trigger} />
      <Dialog.Portal>
        <Dialog.Overlay>
          <Dialog.Content className="fixed inset-0 bg-[#000000b6]">
            <div className="fixed top-1/2 left-1/2 w-[200px] max-w-prose -translate-x-1/2 -translate-y-1/2 transform rounded-md bg-white p-6 shadow-md ">
              <Dialog.Close asChild>
                <button className="btn-neutral-ghost ml-auto p-1.5">
                  <HiX className="h-5 w-5" />
                </button>
              </Dialog.Close>
              <Steps steps={steps} />
            </div>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default StepsModal
