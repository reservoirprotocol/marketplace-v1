import React from 'react'
import * as Tooltip from '@radix-ui/react-tooltip'

type Props = {
  rarityRank: number
  collectionSize: number
}

const RarityTooltip = ({ rarityRank, collectionSize }: Props) => {
  const rankPercentile = Math.floor((rarityRank / collectionSize) * 100)

  return (
    <Tooltip.Provider>
      <Tooltip.Root delayDuration={0} disableHoverableContent>
        <Tooltip.Trigger asChild>
          <div className="mr-4 flex h-6 cursor-pointer items-center justify-between rounded-md border border-neutral-300 px-2.5 py-1.5 text-sm ">
            <img src="/icons/rarity-icon.svg" className="mr-1 h-4 w-4" />
            <span>{rarityRank}</span>
          </div>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            sideOffset={0}
            className="flex max-h-[322px] max-w-[320px] flex-col items-center overflow-y-auto rounded-[10px] bg-neutral-800 p-3 text-xs font-light text-white dark:bg-white dark:text-black"
          >
            <span>Rarity Score</span>
            <span>
              {rarityRank} / {collectionSize} {`(${rankPercentile}%)`}
            </span>
            <Tooltip.Arrow />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  )
}

export default RarityTooltip
