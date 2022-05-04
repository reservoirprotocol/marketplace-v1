import React from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { HiX } from 'react-icons/hi'
import Link from 'next/link'
import { FiChevronRight } from 'react-icons/fi'

const wallets = [
  {
    icon: '/icons/MetaMask.svg',
    name: 'MetaMask',
    href: 'https://metamask.io/download/',
  },
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

const ConnectWalletModal = () => {
  return (
    <Dialog.Root>
      <Dialog.Trigger className="btn-primary-outline dark:border-neutral-600  dark:text-white dark:ring-primary-900 dark:focus:ring-4">
        Connect Wallet
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay>
          <Dialog.Content className="fixed inset-0 bg-[#000000b6]">
            <div className="fixed top-1/2 left-1/2 w-[460px] -translate-x-1/2 -translate-y-1/2 transform rounded-md bg-white p-11 shadow-md dark:bg-black ">
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
              <div className="grid">
                {wallets.map(({ href, icon, name }) => (
                  <Link key={name} href={href}>
                    <a className="reservoir-h6 flex items-center justify-between py-2 dark:text-white">
                      <div className="flex items-center gap-2">
                        <img src={icon} alt="" className="w-8" />
                        <div>{name}</div>
                      </div>
                      <FiChevronRight className="w-8" />
                    </a>
                  </Link>
                ))}
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default ConnectWalletModal
