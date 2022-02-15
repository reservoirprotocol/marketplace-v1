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

const apiBase = process.env.NEXT_PUBLIC_API_BASE

type InfiniteKeyLoader = (
  custom: { url: URL; wildcard: string; isCommunity: boolean; isHome: boolean },
  ...base: Parameters<SWRInfiniteKeyLoader>
) => ReturnType<SWRInfiniteKeyLoader>

const getKey: InfiniteKeyLoader = (
  custom: { url: URL; wildcard: string; isCommunity: boolean; isHome: boolean },
  index: number,
  previousPageData: paths['/users/{user}/tokens']['get']['responses']['200']['schema']
) => {
  const { url, wildcard, isCommunity, isHome } = custom
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

  if (isCommunity) {
    query.community = wildcard
  }

  if (!isHome && !isCommunity) {
    query.collection = wildcard
  }

  setParams(url, query)

  return url.href
}

type Props = InferGetServerSidePropsType<typeof getServerSideProps>

const Address: NextPage<Props> = ({ wildcard, isHome, isCommunity }) => {
  const [{ data: accountData }] = useAccount()
  const router = useRouter()
  useDataDog(accountData)
  // const collections = useCollections(apiBase)

  const { ref, inView } = useInView()

  const url = new URL(`/users/${router.query?.address}/tokens`, apiBase)

  const tokens = useSWRInfinite<
    paths['/users/{user}/tokens']['get']['responses']['200']['schema']
  >(
    (index, previousPageData) =>
      getKey({ url, wildcard, isCommunity, isHome }, index, previousPageData),
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

  // let collectionUrl = new URL(`/collections/${wildcard}`, apiBase)

  // const collection = useSWR<
  //   paths['/collections/{collection}']['get']['responses']['200']['schema']
  // >(collectionUrl.href, fetcher)

  return (
    <Layout>
      <div className="mt-4 mb-10 flex items-center justify-center">
        <EthAccount address={router.query?.address?.toString()} />
      </div>
      <UserTokensGrid tokens={tokens} viewRef={ref} />
    </Layout>
  )
}

export default Address

export const getServerSideProps: GetServerSideProps<{
  wildcard: string
  isCommunity: boolean
  isHome: boolean
}> = async ({ req }) => {
  // ['TLD', 'domain', 'subdomain1', 'subdomain2']
  const hostParts = req.headers.host?.split('.').reverse()

  if (!hostParts) {
    return {
      notFound: true,
    }
  }

  // In development: hostParts = ['localhost:3000', 'subdomain1', 'subdomain2']
  // In production: hostParts = ['TLD', 'domain', 'subdomain1', 'subdomain2']

  // Possible cases
  // ['localhost:3000']
  // ['localhost:3000', 'www']
  // ['market', 'reservoir']
  // ['market', 'reservoir', 'www']
  let wildcard = 'www'

  // For cases: ['localhost:3000', 'www', ...]
  if (hostParts.length > 1 && hostParts[0] === 'localhost:3000')
    wildcard = hostParts[1]

  // For cases: ['market', 'reservoir', 'www', ...]
  if (hostParts.length > 2 && hostParts[0] !== 'localhost:3000')
    wildcard = hostParts[2]

  const isHome: boolean = wildcard === 'www'

  // Check the wildcard corresponds to a community
  const url = new URL('/collections', apiBase)

  const query: paths['/collections']['get']['parameters']['query'] = {
    community: wildcard,
  }

  setParams(url, query)

  let isCommunity: boolean = false

  try {
    const res = await fetch(url.href)
    const collections =
      (await res.json()) as paths['/collections']['get']['responses']['200']['schema']
    if (collections.collections) {
      isCommunity = collections.collections.length > 0
    }
  } catch (err) {
    console.log(err)
  }

  return { props: { wildcard, isHome, isCommunity } }
}
