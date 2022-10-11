import { useUsersActivity } from '@reservoir0x/reservoir-kit-ui'
import ActivityTable from 'components/tables/ActivityTable'
import { FC } from 'react'

type Props = {
  user?: string
}

const UserActivityTab: FC<Props> = ({ user }) => {
  const query: Parameters<typeof useUsersActivity>['1'] = {
    limit: 20,
  }
  const data = useUsersActivity(user ? [user] : undefined, query, {
    revalidateFirstPage: false,
  })

  return <ActivityTable data={data} />
}

export default UserActivityTab
