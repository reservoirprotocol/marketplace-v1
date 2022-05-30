import { FC } from 'react'
import { useInView } from 'react-intersection-observer'

type Props = {
  viewRef?: ReturnType<typeof useInView>['ref']
}

const LoadingCardCollection: FC<Props> = ({ viewRef }) => {
  return (
    <div
      ref={viewRef}
      className="mb-6 grid min-h-[250px] animate-pulse rounded-2xl border border-neutral-300 bg-white p-3 shadow-md dark:border-neutral-600 dark:bg-neutral-800"
    >
      <div className="mb-3 grid grid-cols-[1fr_1fr_auto] items-center gap-1.5">
        <div className="col-span-2 h-full rounded bg-neutral-200 dark:bg-neutral-700"></div>
        <div className="flex flex-col gap-1.5">
          <div className="h-20 w-20 rounded bg-neutral-200 dark:bg-neutral-700"></div>
          <div className="h-20 w-20 rounded bg-neutral-200 dark:bg-neutral-700"></div>
          <div className="h-20 w-20 rounded bg-neutral-200 dark:bg-neutral-700"></div>
        </div>
      </div>
      <div className="mt-auto">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
          <div className="h-4 w-[100px] rounded-md bg-neutral-200 dark:bg-neutral-700"></div>
        </div>
      </div>
    </div>
  )
}

export default LoadingCardCollection
