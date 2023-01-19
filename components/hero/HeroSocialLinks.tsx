import { useMediaQuery } from '@react-hookz/web'
import { FC } from 'react'
import { FiGlobe, FiMoreVertical, FiRefreshCcw } from 'react-icons/fi'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Collection } from 'types/reservoir'
import { useNetwork } from 'wagmi'
import useEnvChain from 'hooks/useEnvChain'

type Props = {
  refreshCollection: (collectionId: string | undefined) => Promise<void>
  collection?: Collection
}

const DARK_MODE = process.env.NEXT_PUBLIC_DARK_MODE

const HeroSocialLinks: FC<Props> = ({ refreshCollection, collection }) => {
  const envChain = useEnvChain()
  const isSmallDevice = useMediaQuery('only screen and (max-width : 768px)')
  const social = {
    twitterUsername: collection?.twitterUsername,
    externalUrl: collection?.externalUrl,
    discordUrl: collection?.discordUrl,
    blockExplorerUrl: `${
      envChain?.blockExplorers?.default.url || 'https://etherscan.io'
    }/address/${collection?.id}`,
  }

  if (!social.twitterUsername && !social.externalUrl && !social.discordUrl) {
    return null
  }

  const etherscanLogo = DARK_MODE
    ? '/icons/etherscan-logo-light-circle.svg'
    : '/icons/etherscan-logo-circle.svg'

  if (isSmallDevice) {
    const dropdownItemClasses =
      'reservoir-gray-dropdown-item flex gap-2 rounded-none border-b text-black last:border-b-0 dark:border-[#525252] dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800 dark:focus:bg-neutral-800'
    return (
      <div className="absolute top-6 right-12">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger className="rounded-lg border bg-white p-2 dark:border-[#525252] dark:bg-black">
            <FiMoreVertical className="h-6 w-6 dark:text-[#D4D4D4]" />
          </DropdownMenu.Trigger>
          <DropdownMenu.Content
            sideOffset={8}
            align="end"
            className="min-w-[172px] overflow-hidden rounded-lg border bg-white shadow-md radix-side-bottom:animate-slide-down dark:border-[#525252] dark:bg-neutral-900 md:max-w-[422px]"
          >
            {typeof social.discordUrl === 'string' && (
              <DropdownMenu.Item asChild>
                <a
                  className={dropdownItemClasses}
                  target="_blank"
                  rel="noopener noreferrer"
                  href={social.discordUrl}
                >
                  <img
                    src="/icons/Discord.svg"
                    alt="Discord Icon"
                    className="h-6 w-6"
                  />
                  Discord
                </a>
              </DropdownMenu.Item>
            )}
            {typeof social.twitterUsername === 'string' && (
              <DropdownMenu.Item asChild>
                <a
                  className={dropdownItemClasses}
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`https://twitter.com/${social.twitterUsername}`}
                >
                  <img
                    src="/icons/Twitter.svg"
                    alt="Twitter Icon"
                    className="h-6 w-6"
                  />
                  Twitter
                </a>
              </DropdownMenu.Item>
            )}
            <DropdownMenu.Item asChild>
              <a
                className={dropdownItemClasses}
                target="_blank"
                rel="noopener noreferrer"
                href={social.blockExplorerUrl}
              >
                <img
                  src={etherscanLogo}
                  alt="Etherscan Icon"
                  className="h-6 w-6"
                />
                {envChain?.blockExplorers?.default.name || 'Etherscan'}
              </a>
            </DropdownMenu.Item>
            {typeof social.externalUrl === 'string' && (
              <DropdownMenu.Item asChild>
                <a
                  className={dropdownItemClasses}
                  target="_blank"
                  rel="noopener noreferrer"
                  href={social.externalUrl}
                >
                  <FiGlobe className="h-6 w-6" />
                  Website
                </a>
              </DropdownMenu.Item>
            )}
            {collection?.id && (
              <DropdownMenu.Item asChild>
                <button
                  className={dropdownItemClasses}
                  onClick={() => refreshCollection(collection?.id)}
                >
                  <FiRefreshCcw className="h-6 w-6" />
                  Refresh Metadata
                </button>
              </DropdownMenu.Item>
            )}
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </div>
    )
  } else {
    return (
      <div className="flex gap-4">
        {typeof social.discordUrl === 'string' && (
          <a
            className="flex-none"
            target="_blank"
            rel="noopener noreferrer"
            href={social.discordUrl}
          >
            <img
              src="/icons/Discord.svg"
              alt="Discord Icon"
              className="h-6 w-6"
            />
          </a>
        )}
        {typeof social.twitterUsername === 'string' && (
          <a
            className="flex-none"
            target="_blank"
            rel="noopener noreferrer"
            href={`https://twitter.com/${social.twitterUsername}`}
          >
            <img
              src="/icons/Twitter.svg"
              alt="Twitter Icon"
              className="h-6 w-6"
            />
          </a>
        )}
        <a
          className="flex-none text-black dark:text-white"
          target="_blank"
          rel="noopener noreferrer"
          href={social.blockExplorerUrl}
        >
          <img src={etherscanLogo} alt="Etherscan Icon" className="h-6 w-6" />
        </a>
        {typeof social.externalUrl === 'string' && (
          <a
            className="flex-none text-black dark:text-white"
            target="_blank"
            rel="noopener noreferrer"
            href={social.externalUrl}
          >
            <FiGlobe className="h-6 w-6" />
          </a>
        )}
      </div>
    )
  }
}

export default HeroSocialLinks
