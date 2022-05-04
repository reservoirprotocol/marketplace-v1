import React, { FC } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { HiX } from 'react-icons/hi'
import Link from 'next/link'
import { FiChevronRight } from 'react-icons/fi'
import { useAccount, useConnect } from 'wagmi'

const wallets = [
  {
    icon: '/icons/WalletConnect.svg',
    name: 'WalletConnect',
    href: 'https://docs.walletconnect.com/quick-start/dapps/client',
  },
  {
    icon: '/icons/Coinbase.svg',
    name: 'Coinbase',
    href: 'https://docs.cloud.coinbase.com/wallet-sdk/docs/installing',
  },
]

const ConnectWalletModal: FC = () => {
  return (
    <Dialog.Root>
      <Dialog.Trigger className="btn-primary-outline dark:border-neutral-600  dark:text-white dark:ring-primary-900 dark:focus:ring-4">
        Connect Wallet
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay>
          <Dialog.Content className="fixed inset-0 bg-[#000000b6]">
            <div className="fixed top-1/2 left-1/2 w-[460px] -translate-x-1/2 -translate-y-1/2 transform rounded-md bg-white p-11 shadow-md dark:bg-black">
              <div className="mb-4 flex items-center justify-between">
                <Dialog.Title className="reservoir-h4 dark:text-white">
                  Connect Wallet
                </Dialog.Title>
                <Dialog.Close className="btn-primary-outline p-1.5 dark:border-neutral-600 dark:text-white dark:ring-primary-900 dark:focus:ring-4">
                  <HiX className="h-5 w-5" />
                </Dialog.Close>
              </div>
              <div className="reservoir-body-2 my-8 dark:text-white">
                Choose your preferred wallet provider
              </div>
              <Wallets2 />
            </div>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default ConnectWalletModal

export const Wallets2: FC = () => {
  const { connect, connectors, error, isConnecting, pendingConnector } =
    useConnect()
  return (
    <div className="grid">
      {connectors.map((connector) => (
        <button
          className="rounded-2xl py-4 hover:bg-neutral-900"
          disabled={!connector.ready}
          key={connector.id}
          onClick={() => connect(connector)}
        >
          {connector.name}
          {!connector.ready && ' (unsupported)'}
          {isConnecting &&
            connector.id === pendingConnector?.id &&
            ' (connecting)'}
        </button>
      ))}

      {error && <div>{error.message}</div>}
    </div>
  )
}

export const Wallets: FC = () => {
  const { connect, connectors } = useConnect()
  const { data: accountData } = useAccount()
  const wallet = connectors[0]

  return (
    <div className="grid">
      {!accountData ? (
        <button
          onClick={() => connect(wallet)}
          className="reservoir-h6 flex items-center justify-between py-2 dark:text-white"
        >
          <div className="flex items-center gap-2">
            <img src="/icons/MetaMask.svg" alt="" className="w-8" />
            <div>MetaMask</div>
          </div>
          <FiChevronRight className="w-8" />
        </button>
      ) : (
        <a
          href="https://metamask.io/download/"
          target="_blank"
          rel="noreferrer noopener"
          className="reservoir-h6 flex items-center justify-between py-2 dark:text-white"
        >
          <div className="flex items-center gap-2">
            <img src="/icons/MetaMask.svg" alt="" className="w-8" />
            <div>MetaMask</div>
          </div>
          <FiChevronRight className="w-8" />
        </a>
      )}
      {wallets.map(({ href, icon, name }) => (
        <Link key={name} href={href}>
          <a
            target="_blank"
            rel="noreferrer noopener"
            className="reservoir-h6 flex items-center justify-between py-2 dark:text-white"
          >
            <div className="flex items-center gap-2">
              <img src={icon} alt="" className="w-8" />
              <div>{name}</div>
            </div>
            <FiChevronRight className="w-8" />
          </a>
        </Link>
      ))}
    </div>
  )
}
