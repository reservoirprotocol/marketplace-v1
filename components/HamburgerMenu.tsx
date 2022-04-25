import * as Dialog from '@radix-ui/react-dialog'
import Link from 'next/link'
import { FC, ReactNode } from 'react'
import { FiMenu } from 'react-icons/fi'
import { HiOutlineLogout, HiX } from 'react-icons/hi'
import { useAccount, useConnect } from 'wagmi'
import { Balance } from './ConnectWallet'
import EthAccount from './EthAccount'

const NAVBAR_LOGO = process.env.NEXT_PUBLIC_NAVBAR_LOGO

type Props = {
  search: ReactNode
  externalLinks: {
    name: string
    url: string
  }[]
}

const HamburgerMenu: FC<Props> = ({ search, externalLinks }) => {
  const [{ data: connectData }, connect] = useConnect()
  const [{ data: accountData, loading }, disconnect] = useAccount({
    fetchEns: true,
  })
  const wallet = connectData.connectors[0]
  const logo = NAVBAR_LOGO || '/reservoir.svg'

  const hasExternalLinks = externalLinks.length > 0
  return (
    <Dialog.Root>
      <Dialog.Trigger className="ml-auto block flex-none md:hidden">
        <FiMenu className="h-6 w-6" />
      </Dialog.Trigger>

      <Dialog.Content className="fixed inset-0 z-10 transform rounded-md bg-white shadow-md">
        <div className="flex items-center justify-between gap-3 border-b border-neutral-300 p-4">
          <img src={logo} alt="" className="w-6 sm:block" />
          <div className="mx-auto h-full w-full max-w-md flex-grow">
            {search}
          </div>
          <Dialog.Close className="btn-primary-outline p-1.5">
            <HiX className="h-6 w-6" />
          </Dialog.Close>
        </div>
        {hasExternalLinks && (
          <div className="grid">
            {externalLinks.map(({ name, url }) => (
              <a
                key={url}
                href={url}
                rel="noopener noferrer"
                className="reservoir-label-l border-b border-neutral-300 p-4 text-[#4B5563] hover:text-[#1F2937]"
              >
                {name}
              </a>
            ))}
          </div>
        )}
        {accountData ? (
          <>
            <div className="reservoir-label-l flex items-center justify-center border-b border-neutral-300 p-4 text-[#4B5563] hover:text-[#1F2937]">
              <EthAccount
                address={accountData.address}
                ens={{
                  avatar: accountData.ens?.avatar,
                  name: accountData.ens?.name,
                }}
              />
            </div>

            <div className="reservoir-label-l flex items-center justify-between border-b border-neutral-300 p-4 text-[#4B5563] hover:text-[#1F2937]">
              <span>Balance </span>
              <span>
                {accountData.address && (
                  <Balance address={accountData.address} />
                )}
              </span>
            </div>

            <Link href={`/address/${accountData.address}`}>
              <a className="group reservoir-label-l flex w-full cursor-pointer items-center justify-between rounded border-b border-neutral-300 p-4 text-[#4B5563] outline-none transition hover:bg-neutral-100 hover:text-[#1F2937] focus:bg-neutral-100">
                Portfolio
              </a>
            </Link>

            <button
              key={wallet.id}
              onClick={() => disconnect()}
              className="group reservoir-label-l flex w-full cursor-pointer items-center justify-between gap-3 rounded border-b border-neutral-300 p-4 text-[#4B5563] outline-none transition hover:bg-neutral-100 hover:text-[#1F2937] focus:bg-neutral-100"
            >
              <span>Disconnect</span>
              <HiOutlineLogout className="h-6 w-7" />
            </button>
          </>
        ) : (
          <button
            key={wallet.id}
            onClick={() => connect(wallet)}
            className="btn-primary-fill col-span-2 col-start-3 ml-auto md:col-span-4 md:col-start-5 lg:col-span-4 lg:col-start-9"
          >
            Connect Wallet
          </button>
        )}

        {/* <a
          className="reservoir-h6 flex items-center gap-2 p-4"
          target="_blank"
          rel="noopener noreferrer"
          href={`https://metamask.io`}
        >
          <img
            src="/icons/Twitter.svg"
            alt="Twitter Icon"
            className="h-6 w-6"
          />
          MetaMask
        </a> */}
      </Dialog.Content>
    </Dialog.Root>
  )
}

export default HamburgerMenu
