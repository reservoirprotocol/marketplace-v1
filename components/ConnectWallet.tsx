import { FC } from 'react'
import { useAccount, useBalance, useConnect } from 'wagmi'
import EthAccount from './EthAccount'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import Link from 'next/link'
import { HiOutlineLogout } from 'react-icons/hi'
import FormatEth from './FormatEth'

const ConnectWallet: FC = () => {
  const [{ data: connectData }, connect] = useConnect()
  const [{ data: accountData, loading }, disconnect] = useAccount({
    fetchEns: true,
  })
  const wallet = connectData.connectors[0]

  if (accountData) {
    return (
      <DropdownMenu.Root>
        <DropdownMenu.Trigger className="btn-primary-outline normal-case">
          {loading ? (
            <div className="bg-primary-50 h-[32px] w-[115px] animate-pulse rounded"></div>
          ) : (
            <EthAccount
              address={accountData.address}
              ens={{
                avatar: accountData.ens?.avatar,
                name: accountData.ens?.name,
              }}
            />
          )}
        </DropdownMenu.Trigger>

        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          className="w-48 space-y-1 rounded bg-white px-1.5 py-2 shadow-md  radix-side-bottom:animate-slide-down md:w-56"
        >
          <div className="group flex w-full items-center justify-between rounded px-4 py-3 outline-none transition">
            <span>Balance </span>
            <span>
              {accountData.address && <Balance address={accountData.address} />}
            </span>
          </div>
          <Link href={`/address/${accountData.address}`}>
            <DropdownMenu.Item asChild>
              <a className="group flex w-full cursor-pointer items-center justify-between rounded px-4 py-3 outline-none transition hover:bg-neutral-100 focus:bg-neutral-100">
                Portfolio
              </a>
            </DropdownMenu.Item>
          </Link>
          <DropdownMenu.Item asChild>
            <button
              key={wallet.id}
              onClick={() => disconnect()}
              className="group flex w-full cursor-pointer items-center justify-between gap-3 rounded px-4 py-3 outline-none transition hover:bg-neutral-100 focus:bg-neutral-100"
            >
              <span>Disconnect</span>
              <HiOutlineLogout className="h-6 w-7" />
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
      className="btn-primary-fill"
    >
      Connect Wallet
    </button>
  )
}

export default ConnectWallet

type Props = {
  address: string
}

export const Balance: FC<Props> = ({ address }) => {
  const [{ data: balance }] = useBalance({ addressOrName: address })
  return <FormatEth amount={balance?.value} maximumFractionDigits={4} />
}
