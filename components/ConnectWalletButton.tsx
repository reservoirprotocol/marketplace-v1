import { ConnectButton } from '@rainbow-me/rainbowkit'
import { FC } from 'react'
import { useAccount } from 'wagmi'

type Props = {
  className?: HTMLButtonElement['className']
  showIcon?: boolean
}

const ConnectWalletButton: FC<Props> = ({ className, showIcon }) => {
  const account = useAccount()

  return (
    <ConnectButton.Custom>
      {({ openConnectModal, authenticationStatus, mounted }) => {
        const ready = mounted && authenticationStatus !== 'loading'

        return (
          <div
            {...((!ready || account.isConnected) && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
                display: 'none',
              },
            })}
          >
            {(() => {
              return (
                <button
                  onClick={openConnectModal}
                  type="button"
                  className={`btn-primary-fill h-full border-none px-3 dark:border-neutral-600 dark:text-white dark:ring-primary-900 dark:focus:ring-4 ${className}`}
                >
                  {showIcon ? (
                    <img src="/icons/wallet.svg" alt="Wallet Icon" />
                  ) : (
                    <span>Connect Wallet</span>
                  )}
                </button>
              )
            })()}
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}

export default ConnectWalletButton
