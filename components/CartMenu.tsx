import { styled, keyframes } from '@stitches/react'
import * as Popover from '@radix-ui/react-popover'
import { FC } from 'react'
import { FaShoppingCart, FaTrashAlt } from 'react-icons/fa'
import FormatEth from './FormatEth'
import { useRecoilState, selector, useRecoilValue } from 'recoil'
import { recoilCartTokens } from './TokensGrid'

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

const recoilCartCount = selector({
  key: 'cartCount',
  get: ({ get }) => {
    const arr = get(recoilCartTokens)

    return arr.length
  },
})

export const recoilTokensMap = selector({
  key: 'cartMapping',
  get: ({ get }) => {
    const arr = get(recoilCartTokens)

    return arr.reduce<Record<string, any>>((map, token) => {
      map[`${token.contract}:${token.tokenId}`] = true
      return map
    }, {})
  },
})

const initialValue = 0
const recoilCartTotal = selector({
  key: 'cartTotal',
  get: ({ get }) => {
    const arr = get(recoilCartTokens)

    const prices = arr.map(({ price }) => {
      if (!price) return 0
      return price
    })

    return prices.reduce(
      (prevVal, currentVal) => prevVal + currentVal,
      initialValue
    )
  },
})

const CartMenu: FC = () => {
  const cartCount = useRecoilValue(recoilCartCount)
  const cartTotal = useRecoilValue(recoilCartTotal)
  const [cartTokens, setCartTokens] = useRecoilState(recoilCartTokens)

  return (
    <Popover.Root>
      <Popover.Trigger>
        <div className="relative grid h-8 w-8 items-center justify-center rounded-full">
          {cartCount > 0 && (
            <div className="reservoir-subtitle absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#7000FF] text-white">
              {cartCount}
            </div>
          )}
          <FaShoppingCart className="h-[18px] w-[18px]" />
        </div>
      </Popover.Trigger>
      <StyledContent
        sideOffset={22}
        className="w-[367px] rounded-2xl bg-white p-6 shadow-lg dark:border dark:border-neutral-700 dark:bg-neutral-900"
      >
        <div className="mb-4 flex justify-between">
          <div className="flex items-center">
            <div className="reservoir-h6 mr-3">My Cart</div>
            <div className="reservoir-subtitle flex h-5 w-5 items-center justify-center rounded-full bg-[#7000FF] text-white">
              {cartCount}
            </div>
          </div>
          {cartCount > 0 && (
            <button
              onClick={() => setCartTokens([])}
              className="text-[#7000FF] dark:text-white"
            >
              Clear
            </button>
          )}
        </div>
        <div className="mb-6 grid max-h-[300px] gap-2 overflow-auto">
          {cartTokens.map(
            ({ collection, contract, name, image, price, tokenId }, index) => {
              return (
                <div
                  key={`${contract}:${tokenId}`}
                  className="flex justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-14 w-14 overflow-hidden rounded-[4px]">
                      <img src={image} alt="" />
                    </div>
                    <div>
                      <div className="reservoir-subtitle">
                        {name || `#${tokenId}`}
                      </div>
                      <div className="reservoir-label-s">{collection}</div>
                      <div className="reservoir-h6">
                        <FormatEth amount={price} logoWidth={7} />
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const newCartTokens = [...cartTokens]
                      newCartTokens.splice(index, 1)
                      setCartTokens(newCartTokens)
                    }}
                  >
                    <FaTrashAlt />
                  </button>
                </div>
              )
            }
          )}
        </div>

        <div className="mb-4 flex justify-between">
          <div className="reservoir-h6">You Pay</div>
          <div className="reservoir-h6">
            <FormatEth amount={cartTotal} logoWidth={7} />
          </div>
        </div>
        <button className="btn-primary-fill w-full">Purchase</button>
      </StyledContent>
    </Popover.Root>
  )
}
export default CartMenu
