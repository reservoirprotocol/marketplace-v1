import { FC } from 'react'
import { useAccount, useConnect } from 'wagmi'
import EthAccount from './EthAccount'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import Link from 'next/link'

const ConnectWallet: FC = () => {
  const [{ data: connectData }, connect] = useConnect()
  const [{ data: accountData }, disconnect] = useAccount({
    fetchEns: true,
  })
  const wallet = connectData.connectors[0]

  if (accountData) {
    return (
      <DropdownMenu.Root>
        <DropdownMenu.Trigger className="flex gap-2 items-center">
          <EthAccount address={accountData.address} ens={accountData.ens} />
        </DropdownMenu.Trigger>
        <DropdownMenu.Content className="absolute z-10 left-0 mt-3 overflow-hidden bg-white dark:bg-neutral-900 divide-y divide-neutral-300 dark:divide-neutral-700 rounded-md shadow-lg ring-1 ring-neutral-300 dark:ring-neutral-700 focus:outline-none">
          <DropdownMenu.Item className="group flex justify-between items-center w-full px-4 py-3 transition">
            <Link href="/profile">
              <a>Profile</a>
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item className="group flex justify-between items-center w-full px-4 py-3 transition">
            <Link href="/tokens">
              <a>My Tokens</a>
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Separator />
          <DropdownMenu.Item className="group flex justify-between items-center w-full px-4 py-3 transition">
            <button key={wallet.id} onClick={() => disconnect()}>
              Disconnect
            </button>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    )
  }
  return (
    <button
      key={wallet.id}
      onClick={() => connect(wallet)}
      className="btn-blue-fill"
    >
      Connect Wallet
    </button>
  )
}

export default ConnectWallet
