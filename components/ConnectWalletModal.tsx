import React, { FC, useContext } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { HiX } from 'react-icons/hi'
import { useConnect } from 'wagmi'
import { FiChevronRight } from 'react-icons/fi'
import { GlobalContext } from 'context/GlobalState'

const ConnectWalletModal: FC = () => {
  const {
    state: {
      connectWallet: { open },
    },
    dispatch,
  } = useContext(GlobalContext)

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(state) =>
        dispatch({ type: 'CONNECT_WALLET', payload: state })
      }
    >
      <Dialog.Trigger className="btn-primary-fill dark:border-neutral-600  dark:text-white dark:ring-primary-900 dark:focus:ring-4">
        Connect Wallet
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay>
          <Dialog.Content className="fixed inset-0 z-[1000] bg-[#000000b6]">
            <div className="fixed top-1/2 left-1/2 w-full -translate-x-1/2 -translate-y-1/2 transform">
              <div className="px-5">
                <div className="mx-auto rounded-2xl border border-neutral-300 bg-white py-11 shadow-xl dark:border-neutral-600 dark:bg-black md:w-[460px]">
                  <div className="mx-12 mb-4 flex items-center justify-between">
                    <Dialog.Title className="reservoir-h4 font-headings dark:text-white">
                      Connect Wallet
                    </Dialog.Title>
                    <Dialog.Close className="btn-primary-outline p-1.5 dark:border-neutral-600 dark:text-white dark:ring-primary-900 dark:focus:ring-4">
                      <HiX className="h-5 w-5" />
                    </Dialog.Close>
                  </div>
                  <div className="reservoir-body-2 my-8 mx-12 dark:text-white">
                    Choose your preferred wallet provider
                  </div>
                  <Wallets />
                </div>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default ConnectWalletModal

const wallets: { [key: string]: any } = {
  // Naming injected as MetaMask is not a mistake
  // This is how it was requested to be labeled
  injected: {
    icon: '/icons/MetaMask.svg',
    name: 'MetaMask',
    href: 'https://metamask.io/download/',
  },
  walletConnect: {
    icon: '/icons/WalletConnect.svg',
    name: 'Wallet Connect',
    href: 'https://docs.walletconnect.com/quick-start/dapps/client',
  },
  coinbaseWallet: {
    icon: '/icons/Coinbase.svg',
    name: 'Coinbase Wallet',
    href: 'https://docs.cloud.coinbase.com/wallet-sdk/docs/installing',
  },
}

export const Wallets: FC = () => {
  const { connect, connectors, error } = useConnect()

  return (
    <div className="grid">
      {connectors.map((connector) => (
        <button
          className="rounded-2xl py-4 hover:bg-neutral-100 dark:hover:bg-neutral-900 md:rounded-none"
          disabled={!connector.ready}
          key={connector.id}
          onClick={() => connect(connector)}
        >
          <a
            target="_blank"
            rel="noreferrer noopener"
            className="reservoir-h6 flex items-center justify-between py-2 px-12 font-headings dark:text-white"
          >
            <div className="flex items-center gap-2">
              {Boolean(wallets[connector.id]?.icon) && (
                <img src={wallets[connector.id]?.icon} alt="" className="w-8" />
              )}
              <div>
                {wallets[connector.id]?.name}
                {!connector.ready && ' (unsupported)'}
              </div>
            </div>
            <FiChevronRight className="h-6 w-6" />
          </a>
        </button>
      ))}

      {error && <div>{error.message}</div>}
    </div>
  )
}
