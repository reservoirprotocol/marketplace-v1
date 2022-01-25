import { FC } from 'react'
import { useInView } from 'react-intersection-observer'

type Props = {
  viewRef?: ReturnType<typeof useInView>['ref']
}

const LoadingCard: FC<Props> = ({ viewRef }) => {
  return (
    <div
      ref={viewRef}
      className="grid h-[250px] animate-pulse rounded-md border border-neutral-300 bg-white dark:border-neutral-700 dark:bg-black"
    >
      <div className="mt-auto p-3">
        <div className="aspect-w-1 aspect-h-1 relative">
          <div className="mb-3 h-full bg-neutral-200 dark:bg-neutral-800"></div>
        </div>
        <div className="flex items-center justify-between py-2">
          <div className="h-5 w-[100px] rounded-md bg-neutral-200 dark:bg-neutral-800"></div>
        </div>
        <div className="flex items-center justify-between py-2">
          <div className="space-y-2">
            <div className="h-3 w-[50px] rounded-md bg-neutral-200 dark:bg-neutral-800"></div>
            <div className="h-3 w-[50px] rounded-md bg-neutral-200 dark:bg-neutral-800"></div>
          </div>
          <div className="space-y-2">
            <div className="h-3 w-[50px] rounded-md bg-neutral-200 dark:bg-neutral-800"></div>
            <div className="h-3 w-[50px] rounded-md bg-neutral-200 dark:bg-neutral-800"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoadingCard
