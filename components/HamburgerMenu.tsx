import * as Dialog from '@radix-ui/react-dialog'
import { FC, ReactNode } from 'react'
import { FiMenu } from 'react-icons/fi'
import { HiX } from 'react-icons/hi'
import ConnectWallet from './ConnectWallet'

const NAVBAR_LOGO = process.env.NEXT_PUBLIC_NAVBAR_LOGO

type Props = {
  search: ReactNode
  externalLinks: {
    name: string
    url: string
  }[]
}

const HamburgerMenu: FC<Props> = ({ search, externalLinks }) => {
  const logo = NAVBAR_LOGO || '/reservoir.svg'

  const hasExternalLinks = externalLinks.length > 0
  return (
    <Dialog.Root>
      <Dialog.Trigger className="ml-auto block flex-none md:hidden">
        <FiMenu className="h-6 w-6" />
      </Dialog.Trigger>

      <Dialog.Content className="fixed inset-0 transform rounded-md bg-white shadow-md">
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
        <div className="p-4">
          <ConnectWallet />
        </div>
        <a
          className="reservoir-h6 flex items-center gap-2 p-4"
          target="_blank"
          rel="noopener noreferrer"
          href={`https://metamask.io`}
        >
          {/* <img
            src="/icons/Twitter.svg"
            alt="Twitter Icon"
            className="h-6 w-6"
          /> */}
          MetaMask
        </a>
      </Dialog.Content>
    </Dialog.Root>
  )
}

export default HamburgerMenu
