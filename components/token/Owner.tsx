import EthAccount from 'components/EthAccount'
import useDetails from 'hooks/useDetails'
import Link from 'next/link'
import { FC } from 'react'
import * as Tooltip from '@radix-ui/react-tooltip'
import { FiAlertCircle } from 'react-icons/fi'

type Props = {
  details: ReturnType<typeof useDetails>
  bannedOnOpenSea: boolean
}

const Owner: FC<Props> = ({ details, bannedOnOpenSea }) => {
  const token = details.data?.tokens?.[0]

  const owner =
    token?.token?.kind === 'erc1155' && token?.market?.floorAsk?.maker
      ? token?.market?.floorAsk?.maker
      : token?.token?.owner

  return (
    <div className="col-span-full md:col-span-4 lg:col-span-5 lg:col-start-2">
      <article className="col-span-full rounded-2xl border border-gray-300 bg-white p-6 dark:border-neutral-600 dark:bg-black">
        <div className="reservoir-h3 mb-6 flex items-center gap-4 overflow-hidden font-headings dark:text-white">
          <div>{token?.token?.name || `#${token?.token?.tokenId}`}</div>
          {bannedOnOpenSea && (
            <Tooltip.Provider>
              <Tooltip.Root delayDuration={0}>
                <Tooltip.Trigger>
                  <FiAlertCircle className="h-6 w-6 text-[#FF3B3B]" />
                </Tooltip.Trigger>
                <Tooltip.Content
                  sideOffset={5}
                  className="reservoir-body-2 w-[191px] rounded-2xl bg-neutral-800 py-3 px-4 text-center text-white dark:bg-neutral-100 dark:text-black"
                >
                  <Tooltip.Arrow className="fill-neutral-800 dark:fill-neutral-100" />
                  Reported for suspicious activity on OpenSea
                </Tooltip.Content>
              </Tooltip.Root>
            </Tooltip.Provider>
          )}
        </div>

        {/* {token?.token?.kind === 'erc1155' && (
          <div className="mb-4 flex justify-evenly">
            <div className="flex items-center gap-2">
              <FiUsers className="h-4 w-4" />
              <span className="reservoir-h5 ">Owners</span>
            </div>
            <div className="flex items-center gap-2">
              <FiDatabase className="h-4 w-4" />
              <span className="reservoir-h5 ">Total</span>
            </div>
          </div>
        )} */}

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
