import { useCollectionActivity } from '@reservoir0x/reservoir-kit-ui'
import ActivityTable from 'components/tables/ActivityTable'
import { FC, useEffect } from 'react'

type Props = {
  collectionId?: string
}

const CollectionActivityTab: FC<Props> = ({ collectionId }) => {
  const query: Parameters<typeof useCollectionActivity>['0'] = {
    limit: 20,
    collection: collectionId,
  }
  const data = useCollectionActivity(query, {
    revalidateOnMount: false,
    fallbackData: [],
  })

  const noActivity = !data.isValidating && data.data.length === 0

  useEffect(() => {
    data.mutate()
    return () => {
      data.setSize(1)
    }
  }, [])

  if (noActivity) {
    return (
      <div className="mt-20 mb-20 flex w-full flex-col justify-center">
        <img
          src="/magnifying-glass.svg"
          className="h-[59px]"
          alt="Magnifying Glass"
        />
        <div className="reservoir-h6 mt-4 mb-2 text-center dark:text-white">
          No activity yet
        </div>
        <div className="text-center text-xs font-light dark:text-white">
          There hasn&apos;t been any activity for this <br /> collection yet.
        </div>
      </div>
    )
  }

  return <ActivityTable data={data} />
}

export default CollectionActivityTab
