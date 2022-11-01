import { useUsersActivity } from '@reservoir0x/reservoir-kit-ui'
import ActivityTable from 'components/tables/ActivityTable'
import { FC, useEffect, useState } from 'react'

type Props = {
  user?: string
}

type ActivityQuery = NonNullable<
  Exclude<Parameters<typeof useUsersActivity>['1'], boolean>
>

const UserActivityTab: FC<Props> = ({ user }) => {
  const [activityTypes, setActivityTypes] = useState<ActivityQuery['types']>([])
  const query: ActivityQuery = {
    limit: 20,
    types: activityTypes,
  }
  const data = useUsersActivity(user ? [user] : undefined, query, {
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
        <div className="reservoir-body mt-14 grid justify-center dark:text-white">
          There hasn&apos;t been any activity yet.
        </div>
      }
    />
  )
}

export default UserActivityTab
