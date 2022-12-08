import EthAccount from 'components/EthAccount'
import Link from 'next/link'
import { FC } from 'react'
import * as Tooltip from '@radix-ui/react-tooltip'
import { FiAlertCircle } from 'react-icons/fi'
import { useTokens } from '@reservoir0x/reservoir-kit-ui'
import { Collection } from 'types/reservoir'
import RarityTooltip from 'components/RarityTooltip'
import { formatNumber } from 'lib/numbers'
import { DownloadButton } from 'components/DownloadButton'
import getAttributeFromTokenDetails from 'lib/getAttributeFromTokenDetails'

type Props = {
  details: ReturnType<typeof useTokens>['data'][0]
  bannedOnOpenSea: boolean
  collection?: Collection
}

const Owner: FC<Props> = ({ details, bannedOnOpenSea, collection }) => {
  const token = details?.token

  const tokenFamily = token && getAttributeFromTokenDetails(token, 'Family')
  const idleLink = token && token?.image!.replace(token?.image!.split('/')[3], tokenFamily + '2')

  const owner =
    token?.kind === 'erc1155' && details?.market?.floorAsk?.maker
      ? details?.market?.floorAsk?.maker
      : token?.owner

  return (
    <div className="col-span-full md:col-span-4 lg:col-span-5 lg:col-start-2">
      <article className="col-span-full pill rounded-[25px] bg-primary-100 p-6 dark:border-neutral-600 dark:bg-black">
        <div className="reservoir-h3 mb-2 flex items-center gap-4 overflow-hidden font-headings dark:text-white">
          <div>{token?.name ? token?.name.replace('finiliar', 'fini') : `#${token?.tokenId}`}</div>
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

        <div className="text-primary-700 mb-2 font-headings dark:text-white">
          This fini is a friend of the following human:
        </div>
        {owner && (
          <Link href={`/address/${owner}`}>
            <a className="inline-block">
              <EthAccount address={owner} side="left" />
            </a>
          </Link>
        )}
        <div className="mt-2 flex flex-col md:flex-row md:space-x-5">
          <DownloadButton gifLink={token?.image!} filename={'fini ' + token?.tokenId! + ' animated.gif'}>
            <div className="text-primary-500 inline-flex text-sm">Download current gif</div>
          </DownloadButton>
          <DownloadButton gifLink={idleLink} filename={'fini ' + token?.tokenId! + ' idle.gif'}>
            <div className="text-primary-500 inline-flex text-sm">Download idle gif</div>
          </DownloadButton>
        </div>
      </article>
    </div>
  )
}

export default Owner
