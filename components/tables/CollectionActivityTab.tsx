import { useCollectionActivity } from '@reservoir0x/reservoir-kit-ui'
import ActivityTable from 'components/tables/ActivityTable'
import { FC } from 'react'

type Props = {
  collectionId?: string
}

const CollectionActivityTab: FC<Props> = ({ collectionId }) => {
  const query: Parameters<typeof useCollectionActivity>['1'] = {
    limit: 20,
  }
  const data = useCollectionActivity(collectionId, query, {
    revalidateFirstPage: false,
  })

  return <ActivityTable data={data} />
}

export default CollectionActivityTab
