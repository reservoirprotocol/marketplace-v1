import { FC } from 'react'
import { useInView } from 'react-intersection-observer'

type Props = {
  viewRef?: ReturnType<typeof useInView>['ref']
}

const LoadingCard: FC<Props> = ({ viewRef }) => {
  return (
    <div
      ref={viewRef}
      className="mb-6 grid min-h-[250px] animate-pulse rounded-b-md border border-neutral-300 bg-white shadow-md dark:border-neutral-600 dark:bg-neutral-900"
    >
      <div className="mt-auto p-3">
        <div className="aspect-w-1 aspect-h-1 relative">
          <div className="mb-3 h-full bg-neutral-200 dark:bg-neutral-800"></div>
        </div>
        <div className="flex items-center justify-between pb-4">
          <div className="h-4 w-[100px] rounded-md bg-neutral-200 dark:bg-neutral-800"></div>
        </div>
        <div className="flex items-center justify-between py-2">
          <div className="space-y-2">
            <div className="h-3 w-[40px] rounded-md bg-neutral-200 dark:bg-neutral-800"></div>
            <div className="h-3 w-[50px] rounded-md bg-neutral-200 dark:bg-neutral-800"></div>
          </div>
          <div className="space-y-2">
            <div className="h-3 w-[50px] rounded-md bg-neutral-200 dark:bg-neutral-800"></div>
            <div className="ml-auto h-3 w-[35px] rounded-md bg-neutral-200 dark:bg-neutral-800"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoadingCard
