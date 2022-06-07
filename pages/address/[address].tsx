import Layout from 'components/Layout'
import {
  GetStaticPaths,
  GetStaticProps,
  InferGetStaticPropsType,
  NextPage,
} from 'next'
import { useRouter } from 'next/router'
import {
  useAccount,
  useNetwork,
  useSigner,
  useEnsName,
  useEnsAvatar,
} from 'wagmi'
import * as Tabs from '@radix-ui/react-tabs'
import { toggleOnItem } from 'lib/router'
import useUserTokens from 'hooks/useUserTokens'
import UserOffersTable from 'components/tables/UserOffersTable'
import UserListingsTable from 'components/tables/UserListingsTable'
import UserTokensGrid from 'components/UserTokensGrid'
import Avatar from 'components/Avatar'
import { ComponentProps } from 'react'
import Toast from 'components/Toast'
import toast from 'react-hot-toast'
import Head from 'next/head'
import useUserAsks from 'hooks/useUserAsks'
import useUserBids from 'hooks/useUserBids'
import { paths, setParams } from '@reservoir0x/client-sdk'
import useSearchCommunity from 'hooks/useSearchCommunity'
import { truncateAddress } from 'lib/truncateText'

// Environment variables
// For more information about these variables
// refer to the README.md file on this repository
// Reference: https://nextjs.org/docs/basic-features/environment-variables#exposing-environment-variables-to-the-browser
// REQUIRED
const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID
const RESERVOIR_API_KEY = process.env.RESERVOIR_API_KEY
const RESERVOIR_API_BASE = process.env.NEXT_PUBLIC_RESERVOIR_API_BASE

// OPTIONAL
const COMMUNITY = process.env.NEXT_PUBLIC_COMMUNITY
const COLLECTION_SET_ID = process.env.NEXT_PUBLIC_COLLECTION_SET_ID

type Props = InferGetStaticPropsType<typeof getStaticProps>

const metadata = {
  title: (title: string) => <title>{title}</title>,
}

const Address: NextPage<Props> = ({ address, fallback }) => {
  const { data: accountData } = useAccount()

  const { data: ensAvatar } = useEnsAvatar({
    addressOrName: address,
  })
  const { data: ensName } = useEnsName({ address })
  const { activeChain } = useNetwork()
  const { data: signer } = useSigner()
  const router = useRouter()
  const userTokens = useUserTokens(address)
  // const userActivity = useUserActivity([], address)
  const collections = useSearchCommunity()
  const sellPositions = useUserAsks([], address, collections)
  const buyPositions = useUserBids([], address, collections)

  if (!CHAIN_ID) {
    console.debug({ CHAIN_ID })
    return <div>There was an error</div>
  }

  const setToast: (data: ComponentProps<typeof Toast>['data']) => any = (
    data
  ) => toast.custom((t) => <Toast t={t} toast={toast} data={data} />)

  const isInTheWrongNetwork = activeChain?.id !== +CHAIN_ID
  const isOwner = address?.toLowerCase() === accountData?.address?.toLowerCase()

  let tabs = [
    { name: 'Portfolio', id: 'portfolio' },
    // { name: 'History', id: 'history' },
  ]

  if (isOwner) {
    tabs = [
      { name: 'Tokens', id: 'portfolio' },
      { name: 'Offers', id: 'buying' },
      { name: 'Listings', id: 'selling' },
      // { name: 'History', id: 'history' },
    ]
  }

  return (
    <Layout navbar={{}}>
      <Head>{metadata.title(`${address} Profile`)}</Head>
      <div className="col-span-full">
        <div className="mt-4 mb-4 w-full px-4 md:px-16">
          <div className="flex">
            {address && (
              <Avatar address={address} avatar={ensAvatar} size={80} />
            )}
            <div className="ml-4">
              <p className="reservoir-h6 text-xl font-semibold dark:text-white">
                {ensName || truncateAddress(address as string)}
              </p>

              <p className="reservoir-label text-md font-semibold opacity-60">
                {truncateAddress(address as string)}
              </p>
            </div>
          </div>
        </div>
        <div className="px-4 md:px-16">
          <Tabs.Root value={router.query?.tab?.toString() || 'portfolio'}>
            <Tabs.List className="mb-4 flex w-full overflow-hidden border-b border-[rgba(0,0,0,0.05)] dark:border-[rgba(255,255,255,0.2)]">
              {tabs.map(({ name, id }) => (
                <Tabs.Trigger
                  key={id}
                  id={id}
                  value={id}
                  className={
                    'group reservoir-label-l relative min-w-0 whitespace-nowrap border-b-2 border-transparent py-4  px-8 text-center hover:text-gray-700 focus:z-10 radix-state-active:border-black radix-state-active:text-gray-900 dark:text-white dark:radix-state-active:border-primary-900'
                  }
                  onClick={() => toggleOnItem(router, 'tab', id)}
                >
                  <span>{name}</span>
                </Tabs.Trigger>
              ))}
            </Tabs.List>
            <Tabs.Content value="portfolio">
              <div className="mt-6">
                <UserTokensGrid
                  data={userTokens}
                  mutate={() => {
                    buyPositions.orders.mutate()
                    userTokens.tokens.mutate()
                    // userActivity.transfers.mutate()
                    sellPositions.orders.mutate()
                  }}
                  isOwner={isOwner}
                  modal={{
                    accountData,
                    isInTheWrongNetwork,
                    collectionId: undefined,
                    setToast,
                    signer,
                  }}
                />
              </div>
              {/* <UserTokensGrid data={userTokens} /> */}
            </Tabs.Content>
            <Tabs.Content value="history">
              {/* <UserActivityTable
            data={userActivity}
            CHAIN_ID={+CHAIN_ID as CHAIN_ID}
          /> */}
            </Tabs.Content>
            {isOwner && (
              <>
                <Tabs.Content value="buying">
                  <UserOffersTable
                    data={buyPositions}
                    mutate={() => {
                      buyPositions.orders.mutate()
                      userTokens.tokens.mutate()
                    }}
                    isOwner={isOwner}
                    maker={address || ''}
                    modal={{
                      accountData,
                      isInTheWrongNetwork,
                      collectionId: undefined,
                      setToast,
                      signer,
                    }}
                  />
                </Tabs.Content>
                <Tabs.Content value="selling" className="col-span-full">
                  <UserListingsTable
                    data={sellPositions}
                    mutate={() => {
                      userTokens.tokens.mutate()
                      sellPositions.orders.mutate()
                    }}
                    isOwner={isOwner}
                    maker={address || ''}
                    modal={{
                      accountData,
                      isInTheWrongNetwork,
                      collectionId: undefined,
                      setToast,
                      signer,
                    }}
                  />
                </Tabs.Content>
              </>
            )}
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
    tokens: paths['/users/{user}/tokens/v2']['get']['responses']['200']['schema']
  }
}> = async ({ params }) => {
  const options: RequestInit | undefined = {}

  const address = params?.address?.toString()

  if (RESERVOIR_API_KEY) {
    options.headers = {
      'x-api-key': RESERVOIR_API_KEY,
    }
  }

  const url = new URL(`/users/${address}/tokens/v2`, RESERVOIR_API_BASE)

  let query: paths['/users/{user}/tokens/v2']['get']['parameters']['query'] = {
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
