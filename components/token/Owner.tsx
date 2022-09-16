import EthAccount from 'components/EthAccount'
import Link from 'next/link'
import { FC } from 'react'
import * as Tooltip from '@radix-ui/react-tooltip'
import { FiAlertCircle } from 'react-icons/fi'
import { useTokens } from '@reservoir0x/reservoir-kit-ui'

type Props = {
  details: ReturnType<typeof useTokens>['data'][0]
  bannedOnOpenSea: boolean
}

const Owner: FC<Props> = ({ details, bannedOnOpenSea }) => {
  const token = details?.token

  const owner =
    token?.kind === 'erc1155' && details?.market?.floorAsk?.maker
      ? details?.market?.floorAsk?.maker
      : token?.owner

  return (
    <div className="col-span-full md:col-span-4 lg:col-span-5 lg:col-start-2">
      <article className="col-span-full rounded-2xl border border-gray-300 bg-white p-6 dark:border-neutral-600 dark:bg-black">
        <div className="reservoir-h3 mb-6 flex items-center gap-4 overflow-hidden font-headings dark:text-white">
          <div>{token?.name || `#${token?.tokenId}`}</div>
          {bannedOnOpenSea && (
            <Tooltip.Provider>
              <Tooltip.Root delayDuration={0}>
                <Tooltip.Trigger>
                  <FiAlertCircle className="h-6 w-6 text-[#FF3B3B]" />
                </Tooltip.Trigger>
                <Tooltip.Content
                  sideOffset={5}
                  className="reservoir-body-2 z-[10000] w-[191px] rounded-2xl bg-neutral-800 py-3 px-4 text-center text-white dark:bg-neutral-100 dark:text-black"
                >
                  <Tooltip.Arrow className="fill-neutral-800 dark:fill-neutral-100" />
                  Token is not tradeable on OpenSea
                </Tooltip.Content>
              </Tooltip.Root>
            </Tooltip.Provider>
          )}
        </div>

        <div className="reservoir-h6 mb-2 font-headings dark:text-white">
          Owner
        </div>
        {owner && (
          <Link href={`/address/${owner}`}>
            <a className="inline-block">
              <EthAccount address={owner} side="left" />
            </a>
          </Link>
        )}
      </article>
    </div>
  )
}

export default Owner
