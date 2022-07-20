import { styled, keyframes } from '@stitches/react'
import * as Popover from '@radix-ui/react-popover'
import { FC } from 'react'
import { FaShoppingCart, FaTrashAlt } from 'react-icons/fa'
import FormatEth from './FormatEth'

const slideDown = keyframes({
  '0%': { opacity: 0, transform: 'translateY(-10px)' },
  '100%': { opacity: 1, transform: 'translateY(0)' },
})

const slideUp = keyframes({
  '0%': { opacity: 0, transform: 'translateY(10px)' },
  '100%': { opacity: 1, transform: 'translateY(0)' },
})

const StyledContent = styled(Popover.Content, {
  animationDuration: '0.6s',
  animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
  animationFillMode: 'forwards',
  '&[data-side="top"]': { animationName: slideUp },
  '&[data-side="bottom"]': { animationName: slideDown },
})

const CartMenu: FC = () => {
  return (
    <Popover.Root>
      <Popover.Trigger>
        <FaShoppingCart className="h-[18px] w-[18px]" />
      </Popover.Trigger>
      <StyledContent
        sideOffset={22}
        className="w-[367px] rounded-2xl bg-white p-6 shadow-lg dark:border dark:border-neutral-700 dark:bg-neutral-900"
      >
        <div className="mb-4 flex justify-between">
          <div className="flex items-center">
            <div className="reservoir-h6 mr-3">My Cart</div>
            <div className="reservoir-subtitle flex h-5 w-5 items-center justify-center rounded-full bg-[#7000FF] text-white">
              1
            </div>
          </div>
          <button className="text-[#7000FF] dark:text-white">Clear</button>
        </div>
        <div className="mb-6 grid max-h-[300px] gap-2 overflow-auto">
          <div className="flex justify-between">
            <div className="flex items-center gap-2">
              <div className="h-14 w-14 overflow-hidden rounded-[4px]">
                <img
                  src="https://lh3.googleusercontent.com/eI4iMn2ffWURlHe5CkxBZZh6q-ExLcYa4uT6CHwpxdRPmhW2JwNmZmUYKiyHsC6NIFBxw2GIX1WQxIuaD-NpFL-millekeVEpmQVF_M"
                  alt=""
                />
              </div>
              <div>
                <div className="reservoir-subtitle">Item Name</div>
                <div className="reservoir-label-s">Collection</div>
                <div className="reservoir-h6">
                  <FormatEth amount={2.1231} logoWidth={7} />
                </div>
              </div>
            </div>
            <button>
              <FaTrashAlt />
            </button>
          </div>
        </div>

        <div className="mb-4 flex justify-between">
          <div className="reservoir-h6">You Pay</div>
          <div className="reservoir-h6">
            <FormatEth amount={2.1231} logoWidth={7} />
          </div>
        </div>
        <button className="btn-primary-fill w-full">Purchase</button>
      </StyledContent>
    </Popover.Root>
  )
}
export default CartMenu
