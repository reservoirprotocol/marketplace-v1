import { ConnectKitButton } from 'connectkit'
import { ButtonHTMLAttributes, FC } from 'react'

type Props = {
  className: string
}

const ConnectWalletButton: FC<ButtonHTMLAttributes<HTMLButtonElement>> = (
  props
) => {
  const { className, ...attributes } = props
  return (
    <ConnectKitButton.Custom>
      {({ show }) => {
        return (
          <button
            className={`btn-primary-fill dark:border-neutral-600 dark:text-white dark:ring-primary-900 dark:focus:ring-4 ${
              className ? className : ''
            }`}
            onClick={show}
            {...attributes}
          >
            Connect Wallet
          </button>
        )
      }}
    </ConnectKitButton.Custom>
  )
}

export default ConnectWalletButton
