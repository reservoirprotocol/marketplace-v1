import EthAccount from 'components/EthAccount'
import Layout from 'components/Layout'
import UserTokensGrid from 'components/UserTokensGrid'
import { paths } from 'interfaces/apiTypes'
import fetcher from 'lib/fetcher'
import setParams from 'lib/params'
import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from 'next'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import useSWRInfinite, { SWRInfiniteKeyLoader } from 'swr/infinite'
import { useInView } from 'react-intersection-observer'
import { useAccount } from 'wagmi'
import useDataDog from 'hooks/useAnalytics'
import getMode from 'lib/getMode'

const apiBase = process.env.NEXT_PUBLIC_API_BASE
const collectionEnv = process.env.NEXT_PUBLIC_COLLECTION
const communityEnv = process.env.NEXT_PUBLIC_COMMUNITY

type InfiniteKeyLoader = (
  custom: { url: URL; collectionId: string; mode: string },
  ...base: Parameters<SWRInfiniteKeyLoader>
) => ReturnType<SWRInfiniteKeyLoader>

const getKey: InfiniteKeyLoader = (
  custom: { url: URL; collectionId: string; mode: string },
  index: number,
  previousPageData: paths['/users/{user}/tokens']['get']['responses']['200']['schema']
) => {
  const { url, collectionId, mode } = custom
  if (!apiBase) {
    console.debug('Environment variable NEXT_PUBLIC_API_BASE is undefined.')
    return null
  }

  // Reached the end
  if (previousPageData && previousPageData?.tokens?.length === 0) return null

  let query: paths['/users/{user}/tokens']['get']['parameters']['query'] = {
    limit: 20,
    offset: index * 20,
  }

  if (mode === 'community') {
    query.community = collectionId
  }

  if (mode === 'collection') {
    query.collection = collectionId
  }

  setParams(url, query)

  return url.href
}

type Props = InferGetServerSidePropsType<typeof getServerSideProps>

const Address: NextPage<Props> = ({ mode, collectionId }) => {
  const [{ data: accountData }] = useAccount()
  const router = useRouter()
  useDataDog(accountData)

  const { ref, inView } = useInView()

  const url = new URL(`/users/${router.query?.address}/tokens`, apiBase)

  const tokens = useSWRInfinite<
    paths['/users/{user}/tokens']['get']['responses']['200']['schema']
  >(
    (index, previousPageData) =>
      getKey({ url, mode, collectionId }, index, previousPageData),
    fetcher,
    {
      revalidateFirstPage: false,
      // revalidateOnMount: false,
    }
  )

  // Fetch more data when component is visible
  useEffect(() => {
    if (inView) {
      tokens.setSize(tokens.size + 1)
    }
  }, [inView])

  const address = router.query?.address?.toString()

  return (
    <Layout>
      <div className="mt-4 mb-10 flex items-center justify-center">
        {address && <EthAccount address={address} />}
      </div>
      <UserTokensGrid tokens={tokens} viewRef={ref} />
    </Layout>
  )
}

export default Address

export const getServerSideProps: GetServerSideProps<{
  mode: string
  collectionId: string
}> = async ({ req }) => {
  const { collectionId, mode } = getMode(req, communityEnv, collectionEnv)

  return { props: { collectionId, mode } }
}
