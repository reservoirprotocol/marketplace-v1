import React, { FC } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { HiX } from 'react-icons/hi'
import { RecoilState, useRecoilState } from 'recoil'
import recoilCartTokens from 'recoil/cart/atom'

type Props = {
  open: boolean
  setOpen: (open: boolean) => void
  cart?: typeof recoilCartTokens['__tag']['0']
}

const SwapCartModal: FC<Props> = ({ open, setOpen, cart }) => {
  const [_cartTokens, setCartTokens] = useRecoilState(recoilCartTokens)

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay>
          <Dialog.Content className="fixed inset-0 z-[10000000000] bg-[#000000b6]">
            <div className="fixed top-1/2 left-1/2 w-full -translate-x-1/2 -translate-y-1/2 transform">
              <div className="px-5">
                <div className="mx-auto overflow-hidden rounded-2xl border border-neutral-300 bg-white p-11 shadow-xl dark:border-neutral-600 dark:bg-black md:w-[637px]">
                  <div className="mb-4 flex items-center justify-between">
                    <Dialog.Title className="reservoir-h5 font-headings dark:text-white">
                      Are you sure you want to add this item?
                    </Dialog.Title>
                    <Dialog.Close
                      onClick={() => setOpen(false)}
                      className="btn-primary-outline p-1.5 dark:border-neutral-600 dark:text-white dark:ring-primary-900 dark:focus:ring-4"
                    >
                      <HiX className="h-5 w-5" />
                    </Dialog.Close>
                  </div>
                  <div className="mb-4 mt-[22px] text-base font-medium text-neutral-600 dark:text-white">
                    Listings with different currencies cannot be added to the
                    same cart. By adding this item to your cart all other items
                    will automatically be removed.
                  </div>
                  <div className="flex gap-4">
                    <Dialog.Close
                      onClick={() => {
                        setCartTokens(cart || [])
                        setOpen(false)
                      }}
                      className="btn-primary-fill w-full dark:border-neutral-600  dark:text-white dark:ring-primary-900 dark:focus:ring-4"
                    >
                      Yes
                    </Dialog.Close>
                    <Dialog.Close
                      onClick={() => setOpen(false)}
                      className="btn-primary-outline w-full dark:border-neutral-600  dark:text-white dark:ring-primary-900 dark:focus:ring-4"
                    >
                      No
                    </Dialog.Close>
                  </div>
                </div>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default SwapCartModal
