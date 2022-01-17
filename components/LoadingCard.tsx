import useIsVisible from 'lib/useIsVisible'
import { FC } from 'react'

type Props = {
  viewRef?: ReturnType<typeof useIsVisible>['containerRef']
}

const LoadingCard: FC<Props> = ({ viewRef }) => {
  return (
    <div
      ref={viewRef}
      className="h-[250px] grid animate-pulse rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-black"
    >
      <div className="p-3 mt-auto">
        <div className="relative aspect-w-1 aspect-h-1">
          <div className="h-full mb-3 bg-neutral-200 dark:bg-neutral-800"></div>
        </div>
        <div className="py-2 flex items-center justify-between">
          <div className="h-5 bg-neutral-200 dark:bg-neutral-800 rounded-md w-[100px]"></div>
        </div>
        <div className="py-2 flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded-md w-[50px]"></div>
            <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded-md w-[50px]"></div>
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded-md w-[50px]"></div>
            <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded-md w-[50px]"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoadingCard
