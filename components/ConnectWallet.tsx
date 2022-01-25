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
        <DropdownMenu.Trigger className="flex items-center gap-2">
          <EthAccount address={accountData.address} ens={accountData.ens} />
        </DropdownMenu.Trigger>
        <DropdownMenu.Content className="absolute left-0 z-10 mt-3 divide-y divide-neutral-300 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-neutral-300 focus:outline-none dark:divide-neutral-700 dark:bg-neutral-900 dark:ring-neutral-700">
          <DropdownMenu.Item className="group flex w-full items-center justify-between px-4 py-3 transition">
            <Link href={`/address/${accountData.address}`}>
              <a>My Tokens</a>
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Separator />
          <DropdownMenu.Item className="group flex w-full items-center justify-between px-4 py-3 transition">
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
