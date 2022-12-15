import { useCollectionActivity } from '@reservoir0x/reservoir-kit-ui'
import ActivityTable from 'components/tables/ActivityTable'
import { FC, useEffect, useState } from 'react'

type Props = {
  collectionId?: string
}

type ActivityQuery = NonNullable<
  Exclude<Parameters<typeof useCollectionActivity>['0'], boolean>
>

const CollectionActivityTab: FC<Props> = ({ collectionId }) => {
  const [activityTypes, setActivityTypes] = useState<ActivityQuery['types']>([
    'sale',
  ])

  const query: ActivityQuery = {
    limit: 20,
    collection: collectionId,
    types: activityTypes,
  }
  const data = useCollectionActivity(query, {
    revalidateOnMount: false,
    fallbackData: [],
    revalidateFirstPage: true,
  })

  useEffect(() => {
    data.mutate()
    return () => {
      data.setSize(1)
    }
  }, [])

  return (
    <ActivityTable
      data={data}
      types={activityTypes}
      onTypesChange={(types) => {
        setActivityTypes(types)
      }}
      emptyPlaceholder={
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
      }
    />
  )
}

export default CollectionActivityTab
