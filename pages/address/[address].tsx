import EthAccount from 'components/EthAccount'
import Layout from 'components/Layout'
import UserTokensGrid from 'components/UserTokensGrid'
import { paths } from 'interfaces/apiTypes'
import fetcher from 'lib/fetcher'
import setParams from 'lib/params'
import { GetServerSideProps, InferGetStaticPropsType, NextPage } from 'next'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import useSWRInfinite, { SWRInfiniteKeyLoader } from 'swr/infinite'
import { useInView } from 'react-intersection-observer'
import useSWR from 'swr'
import { useAccount } from 'wagmi'
import useDataDog from 'hooks/useAnalytics'
import useCollections from 'hooks/useCollections'

const apiBase = process.env.NEXT_PUBLIC_API_BASE

type InfiniteKeyLoader = (
  url: URL,
  wildcard: string,
  isHome: boolean,
  ...base: Parameters<SWRInfiniteKeyLoader>
) => ReturnType<SWRInfiniteKeyLoader>

const getKey: InfiniteKeyLoader = (
  url: URL,
  wildcard: string,
  isHome: boolean,
  index: number,
  previousPageData: paths['/users/{user}/tokens']['get']['responses']['200']['schema']
) => {
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

  if (!isHome) {
    query.collection = wildcard
  }

  setParams(url, query)

  return url.href
}

type Props = InferGetStaticPropsType<typeof getServerSideProps>

const Address: NextPage<Props> = ({ wildcard, isHome }) => {
  const [{ data: accountData }] = useAccount()
  const router = useRouter()
  useDataDog(accountData)
  const collections = useCollections(apiBase)

  const { ref, inView } = useInView()

  const url = new URL(`/users/${router.query?.address}/tokens`, apiBase)

  const tokens = useSWRInfinite<
    paths['/users/{user}/tokens']['get']['responses']['200']['schema']
  >(
    (index, previousPageData) =>
      getKey(url, wildcard, isHome, index, previousPageData),
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

  let collectionUrl = new URL(`/collections/${wildcard}`, apiBase)

  const collection = useSWR<
    paths['/collections/{collection}']['get']['responses']['200']['schema']
  >(collectionUrl.href, fetcher)

  return (
    <Layout
      title="Address Tokens"
      navbar={{
        isHome,
        collections,
      }}
    >
      <div className="mt-4 mb-10 flex items-center justify-center">
        <EthAccount address={router.query?.address?.toString()} />
      </div>
      <UserTokensGrid tokens={tokens} viewRef={ref} />
    </Layout>
  )
}

export default Address

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const hostParts = req.headers.host?.split('.').reverse()
  // Make sure that the host contains at least one subdomain
  // ['subdomain', 'domain', 'TLD']
  // Reverse the host parts to make sure that the third element always
  // corresponds to the first subdomain
  // ['TLD', 'domain', 'subdomain1', 'subdomain2']
  if (!hostParts) {
    return {
      notFound: true,
    }
  }

  // In development: hostParts = ['localhost:3000', 'subdomain1', 'subdomain2']
  // In production: hostParts = ['TLD', 'domain', 'subdomain1', 'subdomain2']
  const wildcard =
    hostParts[0] === 'localhost:3000' ? hostParts[1] : hostParts[2]

  const isHome: boolean = wildcard === 'www'

  return { props: { wildcard, isHome } }
}
