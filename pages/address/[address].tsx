import Layout from 'components/Layout'
import {
  GetStaticPaths,
  GetStaticProps,
  InferGetStaticPropsType,
  NextPage,
} from 'next'
import { useRouter } from 'next/router'
import { useAccount, useNetwork, useEnsName, useEnsAvatar } from 'wagmi'
import * as Tabs from '@radix-ui/react-tabs'
import { toggleOnItem } from 'lib/router'
import UserOffersTable from 'components/tables/UserOffersTable'
import UserOffersReceivedTable from 'components/tables/UserOffersReceivedTable'
import UserListingsTable from 'components/tables/UserListingsTable'
import UserTokensGrid from 'components/UserTokensGrid'
import Avatar from 'components/Avatar'
import { ComponentProps } from 'react'
import Toast from 'components/Toast'
import toast from 'react-hot-toast'
import Head from 'next/head'
import useSearchCommunity from 'hooks/useSearchCommunity'
import { truncateAddress } from 'lib/truncateText'
import { paths, setParams } from '@reservoir0x/reservoir-kit-client'
import UserActivityTab from 'components/tables/UserActivityTab'
import useMounted from 'hooks/useMounted'

const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID
const COLLECTION = process.env.NEXT_PUBLIC_COLLECTION
const COMMUNITY = process.env.NEXT_PUBLIC_COMMUNITY
const COLLECTION_SET_ID = process.env.NEXT_PUBLIC_COLLECTION_SET_ID
const RESERVOIR_API_KEY = process.env.RESERVOIR_API_KEY
const RESERVOIR_API_BASE = process.env.NEXT_PUBLIC_RESERVOIR_API_BASE

type Props = InferGetStaticPropsType<typeof getStaticProps>

type UseEnsNameAddress = NonNullable<
  Parameters<typeof useEnsName>['0']
>['address']

const metadata = {
  title: (title: string) => <title>{title}</title>,
}

const Address: NextPage<Props> = ({ address, fallback }) => {
  const isMounted = useMounted()
  const router = useRouter()
  const accountData = useAccount()

  if (!address) {
    throw 'No address set'
  }

  const { data: ensAvatar } = useEnsAvatar({
    addressOrName: address,
  })

  const { data: ensName } = useEnsName({
    address: address as UseEnsNameAddress,
    onSettled(data, error) {
      console.log('Settled', { data, error })
    },
    onError(error) {
      console.log('Error', error)
    },
  })
  const { chain: activeChain } = useNetwork()
  const collections = useSearchCommunity()
  let collectionIds: undefined | string[] = undefined

  if (COLLECTION && !COMMUNITY && !COLLECTION_SET_ID) {
    collectionIds = [COLLECTION]
  }

  if (COMMUNITY || COLLECTION_SET_ID) {
    collectionIds =
      (collections?.data?.collections
        ?.map(({ contract }) => contract)
        .filter((contract) => !!contract) as string[]) || []
  }

  if (!CHAIN_ID) {
    console.debug({ CHAIN_ID })
    return <div>There was an error</div>
  }

  if (!isMounted) {
    return null
  }

  const setToast: (data: ComponentProps<typeof Toast>['data']) => any = (
    data
  ) => toast.custom((t) => <Toast t={t} toast={toast} data={data} />)

  const isInTheWrongNetwork = activeChain?.id !== +CHAIN_ID
  const isOwner = address?.toLowerCase() === accountData?.address?.toLowerCase()
  const formattedAddress = truncateAddress(address as string)

  let tabs = [
    { name: 'Tokens', id: 'portfolio' },
    { name: 'Listings', id: 'listings' },
  ]

  if (isOwner) {
    tabs = [
      { name: 'Tokens', id: 'portfolio' },
      { name: 'Offers Made', id: 'buying' },
      { name: 'Active Listings', id: 'listings' },
      { name: 'Inactive Listings', id: 'listings_inactive' },
    ]
  }

  tabs.push({ name: 'Activity', id: 'activity' })

  return (
    <Layout navbar={{}}>
      <Head>{metadata.title(`${address} Profile`)}</Head>
      <div className="col-span-full">
        <div className="mt-4 mb-4 w-full px-4 md:px-16">
          <div className="flex">
            {address && (
              <Avatar address={address} avatar={ensAvatar} size={80} />
            )}
            <div className="ml-4 flex flex-col justify-center">
              <p className="reservoir-h6 text-xl font-semibold dark:text-white">
                {ensName || formattedAddress}
              </p>
              {ensName && (
                <p className="reservoir-label text-md font-semibold opacity-60">
                  {formattedAddress}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="px-4 md:px-16">
          <Tabs.Root value={router.query?.tab?.toString() || 'portfolio'}>
            <Tabs.List className="no-scrollbar mb-4 ml-[-15px] flex w-[calc(100%_+_30px)] overflow-y-scroll border-b border-[rgba(0,0,0,0.05)] dark:border-[rgba(255,255,255,0.2)] md:ml-0 md:w-full">
              {tabs.map(({ name, id }) => (
                <Tabs.Trigger
                  key={id}
                  id={id}
                  value={id}
                  className={
                    'group reservoir-label-l relative min-w-0 shrink-0 whitespace-nowrap border-b-2 border-transparent  py-4 px-8 text-center hover:text-gray-700 focus:z-10 radix-state-active:border-black radix-state-active:text-gray-900 dark:text-white dark:radix-state-active:border-primary-900'
                  }
                  onClick={() => toggleOnItem(router, 'tab', id)}
                >
                  <span>{name}</span>
                </Tabs.Trigger>
              ))}
            </Tabs.List>
            <Tabs.Content value="portfolio">
              <div className="mt-6">
                <UserTokensGrid fallback={fallback} owner={address || ''} />
              </div>
            </Tabs.Content>
            {isOwner && (
              <>
                <Tabs.Content value="buying">
                  <UserOffersTable
                    collectionIds={collectionIds}
                    modal={{
                      isInTheWrongNetwork,
                      setToast,
                    }}
                  />
                </Tabs.Content>
                <Tabs.Content value="selling" className="col-span-full">
                  <UserListingsTable
                    isOwner={isOwner}
                    collectionIds={collectionIds}
                    modal={{
                      isInTheWrongNetwork,
                      setToast,
                    }}
                  />
                </Tabs.Content>
              </>
            )}
            <Tabs.Content value="listings" className="col-span-full">
              <UserListingsTable
                isOwner={isOwner}
                collectionIds={collectionIds}
                modal={{
                  isInTheWrongNetwork,
                  setToast,
                }}
                showActive
              />
            </Tabs.Content>
            {isOwner && (
              <Tabs.Content value="listings_inactive" className="col-span-full">
                <UserListingsTable
                  isOwner={isOwner}
                  collectionIds={collectionIds}
                  modal={{
                    isInTheWrongNetwork,
                    setToast,
                  }}
                />
              </Tabs.Content>
            )}
            <Tabs.Content value="activity" className="col-span-full">
              <UserActivityTab user={address} />
            </Tabs.Content>
          </Tabs.Root>
        </div>
      </div>
    </Layout>
  )
}

export default Address

export const getStaticPaths: GetStaticPaths = () => {
  return {
    paths: [],
    fallback: 'blocking',
  }
}

export const getStaticProps: GetStaticProps<{
  address: string | undefined
  fallback: {
    tokens: paths['/users/{user}/tokens/v5']['get']['responses']['200']['schema']
  }
}> = async ({ params }) => {
  const options: RequestInit | undefined = {}

  const address = params?.address?.toString()

  if (RESERVOIR_API_KEY) {
    options.headers = {
      'x-api-key': RESERVOIR_API_KEY,
    }
  }

  const url = new URL(`${RESERVOIR_API_BASE}/users/${address}/tokens/v5`)

  let query: paths['/users/{user}/tokens/v5']['get']['parameters']['query'] = {
    limit: 20,
    offset: 0,
  }

  if (COLLECTION_SET_ID) {
    query.collectionsSetId = COLLECTION_SET_ID
  } else {
    if (COMMUNITY) query.community = COMMUNITY
  }

  setParams(url, query)

  const res = await fetch(url.href, options)

  const tokens = (await res.json()) as Props['fallback']['tokens']

  return {
    props: {
      address,
      fallback: {
        tokens,
      },
    },
  }
}
