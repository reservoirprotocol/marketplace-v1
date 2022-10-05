import { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import { useCollectionActivity as useCollectionActivityRk } from '@reservoir0x/reservoir-kit-ui'

export type Activity = ReturnType<typeof useCollectionActivityRk>['data']

export default function useCollectionActivity(
  collectionId: string | undefined,
  fallbackData: Activity[]
) {
  const { ref, inView } = useInView()

  const query: Parameters<typeof useCollectionActivityRk>['1'] = {
    limit: 20,
  }

  const activity = useCollectionActivityRk(collectionId, query, {
    revalidateFirstPage: false,
    fallbackData,
  })

  // Fetch more data when component is visible
  useEffect(() => {
    if (inView) activity.fetchNextPage()
  }, [inView])

  return { activity, ref }
}
