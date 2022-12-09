import { styled, keyframes } from '@stitches/react'
import * as Popover from '@radix-ui/react-popover'
import { FC, useState } from 'react'
import { FaShoppingCart, FaTrashAlt } from 'react-icons/fa'
import { useRecoilState, useRecoilValue } from 'recoil'
import { Execute } from '@reservoir0x/reservoir-kit-client'
import { Signer } from 'ethers'
import { setToast } from './token/setToast'
import { useAccount, useBalance, useSigner } from 'wagmi'
import { useReservoirClient } from '@reservoir0x/reservoir-kit-ui'
import cartTokensAtom, {
  getCartCount,
  getCartCurrency,
  getCartTotalPrice,
  getPricingPools,
} from 'recoil/cart'
import FormatCrypto from 'components/FormatCrypto'
import { getPricing } from 'lib/token/pricing'

type UseBalanceToken = NonNullable<Parameters<typeof useBalance>['0']>['token']

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
  const cartCount = useRecoilValue(getCartCount)
  const cartTotal = useRecoilValue(getCartTotalPrice)
  const cartCurrency = useRecoilValue(getCartCurrency)
  const pricingPools = useRecoilValue(getPricingPools)
  const [cartTokens, setCartTokens] = useRecoilState(cartTokensAtom)
  const [_open, setOpen] = useState(false)
  const [_steps, setSteps] = useState<Execute['steps']>()
  const [waitingTx, setWaitingTx] = useState<boolean>(false)
  const { data: signer } = useSigner()
  const { address } = useAccount()
  const reservoirClient = useReservoirClient()
  const { data: balance } = useBalance({
    addressOrName: address,
    token:
      cartCurrency?.symbol !== 'ETH'
        ? (cartCurrency?.contract as UseBalanceToken)
        : undefined,
  })

  const execute = async (signer: Signer) => {
    setWaitingTx(true)

    if (!signer) {
      throw 'Missing a signer'
    }

    if (cartTokens.length === 0) {
      throw 'Missing tokens to purchase'
    }

    if (!reservoirClient) throw 'Client not started'

    await reservoirClient.actions
      .buyToken({
        expectedPrice: cartTotal,
        tokens: cartTokens.map((token) => token.token),
        signer,
        onProgress: setSteps,
        options: {
          partial: true,
        },
      })
      .then(() => setCartTokens([]))
      .catch((err: any) => {
        if (err?.type === 'price mismatch') {
          setToast({
            kind: 'error',
            message: 'Price was greater than expected.',
            title: 'Could not buy token',
          })
          return
        }

        if (err?.message.includes('ETH balance')) {
          setToast({
            kind: 'error',
            message: 'You have insufficient funds to buy this token.',
            title: 'Not enough ETH balance',
          })
          return
        }
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
          title: 'Could not buy token',
        })
      })

    setWaitingTx(false)
  }

  return (
    <Popover.Root>
      <Popover.Trigger>
        <div className="relative z-10 grid h-8 w-8 items-center justify-center rounded-full">
          {cartCount > 0 && (
            <div className="reservoir-subtitle absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-700 text-white">
              {cartCount}
            </div>
          )}
          <FaShoppingCart className="h-[18px] w-[18px]" />
        </div>
      </Popover.Trigger>
      <StyledContent
        sideOffset={22}
        className="z-[10000000] w-[367px] rounded-2xl bg-white p-6 shadow-lg dark:border dark:border-neutral-700 dark:bg-neutral-900"
      >
        <div className="mb-4 flex justify-between">
          <div className="flex items-center">
            <div className="reservoir-h6 mr-3">My Cart</div>
            <div className="reservoir-subtitle flex h-5 w-5 items-center justify-center rounded-full bg-primary-700 text-white">
              {cartCount}
            </div>
          </div>
          {cartCount > 0 && (
            <button
              onClick={() => setCartTokens([])}
              className="text-primary-700 dark:text-white"
            >
              Clear
            </button>
          )}
        </div>
        <div className="mb-6 grid max-h-[300px] gap-2 overflow-auto">
          {cartTokens.map((tokenData, index) => {
            const { token } = tokenData
            const { collection, contract, name, image, tokenId } = token
            const price = getPricing(pricingPools, tokenData)

            return (
              <div
                key={`${contract}:${tokenId}`}
                className="flex justify-between"
              >
                <div className="flex items-center gap-2">
                  <div className="h-14 w-14 overflow-hidden rounded-[4px]">
                    <img src={image || collection?.image} alt="" />
                  </div>
                  <div>
                    <div className="reservoir-subtitle">
                      {name || `#${tokenId}`}
                    </div>
                    <div className="reservoir-label-s">{collection?.name}</div>
                    <div className="reservoir-h6">
                      <FormatCrypto
                        amount={price?.amount?.decimal}
                        address={price?.currency?.contract}
                        decimals={price?.currency?.decimals}
                      />
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
          })}
        </div>

        <div className="mb-4 flex justify-between">
          <div className="reservoir-h6">You Pay</div>
          <div className="reservoir-h6">
            <FormatCrypto
              amount={cartTotal}
              address={cartCurrency?.contract}
              decimals={cartCurrency?.decimals}
            />
          </div>
        </div>
        {balance?.formatted && +balance.formatted < cartTotal && (
          <div className="mb-2 text-center ">
            <span className="reservoir-headings text-[#FF6369]">
              Insufficient balance{' '}
            </span>
            <FormatCrypto
              amount={+balance.formatted}
              address={cartCurrency?.contract}
              decimals={cartCurrency?.decimals}
            />
          </div>
        )}
        <button
          onClick={() => signer && execute(signer)}
          disabled={
            cartCount === 0 ||
            waitingTx ||
            Boolean(balance?.formatted && +balance.formatted < cartTotal)
          }
          className="btn-primary-fill w-full"
        >
          {waitingTx ? 'Waiting' : 'Purchase'}
        </button>
      </StyledContent>
    </Popover.Root>
  )
}
export default CartMenu
