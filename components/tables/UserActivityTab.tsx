import { useUsersActivity } from '@reservoir0x/reservoir-kit-ui'
import ActivityTable from 'components/tables/ActivityTable'
import { FC, useEffect } from 'react'

type Props = {
  user?: string
}

const UserActivityTab: FC<Props> = ({ user }) => {
  const query: Parameters<typeof useUsersActivity>['1'] = {
    limit: 20,
  }
  const data = useUsersActivity(user ? [user] : undefined, query, {
    revalidateOnMount: false,
  })

  useEffect(() => {
    data.mutate()
    return () => {
      data.setSize(1)
    }
  }, [])

  const noActivity = !data.isValidating && data.data.length === 0

  if (noActivity) {
    return (
      <div className="reservoir-body mt-14 grid justify-center dark:text-white">
        There hasn&apos;t been any activity yet.
      </div>
    )
  }

  return <ActivityTable data={data} />
}

export default UserActivityTab
