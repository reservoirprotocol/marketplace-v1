import EthAccount from 'components/EthAccount'
import Layout from 'components/Layout'
import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from 'next'
import { useRouter } from 'next/router'
import { useAccount, useNetwork, useSigner } from 'wagmi'
import useDataDog from 'hooks/useAnalytics'
import getMode from 'lib/getMode'
import * as Tabs from '@radix-ui/react-tabs'
import { toggleOnItem } from 'lib/router'
import useUserTokens from 'hooks/useUserTokens'
import UserOffersTable from 'components/tables/UserOffersTable'
import UserListingsTable from 'components/tables/UserListingsTable'
import UserTokensTable from 'components/tables/UserTokensTable'
import { ComponentProps } from 'react'
import Toast from 'components/Toast'
import toast from 'react-hot-toast'
import Head from 'next/head'
import { paths } from '@reservoir0x/client-sdk'
import setParams from 'lib/params'
import useUserAsks from 'hooks/useUserAsks'
import useUserBids from 'hooks/useUserBids'

// Environment variables
// For more information about these variables
// refer to the README.md file on this repository
// Reference: https://nextjs.org/docs/basic-features/environment-variables#exposing-environment-variables-to-the-browser
// REQUIRED
const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID
const RESERVOIR_API_BASE = process.env.NEXT_PUBLIC_RESERVOIR_API_BASE
const RESERVOIR_API_KEY = process.env.RESERVOIR_API_KEY

// OPTIONAL
const COLLECTION = process.env.NEXT_PUBLIC_COLLECTION
const COMMUNITY = process.env.NEXT_PUBLIC_COMMUNITY
const USE_WILDCARD = process.env.NEXT_PUBLIC_USE_WILDCARD
const META_TITLE = process.env.NEXT_PUBLIC_META_TITLE

type Props = InferGetServerSidePropsType<typeof getServerSideProps>

const Address: NextPage<Props> = ({ mode, collectionId }) => {
  const [{ data: accountData }] = useAccount()
  const [{ data: network }] = useNetwork()
  const [{ data: signer }] = useSigner()
  const router = useRouter()
  useDataDog(accountData)
  const address = router.query?.address?.toString()?.toLowerCase()
  const userTokens = useUserTokens(collectionId, [], mode, address)
  // const userActivity = useUserActivity([], address)
  const sellPositions = useUserAsks([], address)
  const buyPositions = useUserBids([], address)

  if (!CHAIN_ID) {
    console.debug({ CHAIN_ID })
    return <div>There was an error</div>
  }

  const setToast: (data: ComponentProps<typeof Toast>['data']) => any = (
    data
  ) => toast.custom((t) => <Toast t={t} toast={toast} data={data} />)

  const isInTheWrongNetwork = network.chain?.id !== +CHAIN_ID
  const isOwner = address?.toLowerCase() === accountData?.address?.toLowerCase()

  let tabs = [
    { name: 'Portfolio', id: 'portfolio' },
    // { name: 'History', id: 'history' },
  ]

  if (isOwner) {
    tabs = [
      { name: 'Portfolio', id: 'portfolio' },
      { name: 'Buying', id: 'buying' },
      { name: 'Selling', id: 'selling' },
      // { name: 'History', id: 'history' },
    ]
  }

  const title = META_TITLE ? (
    <title>{META_TITLE}</title>
  ) : (
    <title>{address} Profile | Reservoir Market</title>
  )

  return (
    <Layout navbar={{ mode, communityId: collectionId }}>
      <Head>{title}</Head>
      <div className="col-span-full mt-4 mb-10 justify-self-center">
        {address && <EthAccount address={address} />}
      </div>
      <Tabs.Root
        value={router.query?.tab?.toString() || 'portfolio'}
        className="col-span-full grid grid-cols-4 gap-4 md:grid-cols-8 lg:grid-cols-12"
      >
        <Tabs.List className="col-span-full mb-4 flex overflow-hidden rounded-lg shadow md:col-span-4 md:col-start-3 lg:col-span-4 lg:col-start-5">
          {tabs.map(({ name, id }) => (
            <Tabs.Trigger
              key={id}
              id={id}
              value={id}
              className={
                'group reservoir-label-l relative w-full min-w-0 whitespace-nowrap border-b-2 border-transparent bg-white py-4 px-12 text-center hover:bg-gray-50 hover:text-gray-700 focus:z-10 radix-state-active:border-black radix-state-active:text-gray-900 dark:bg-neutral-900 dark:text-white dark:radix-state-active:border-white'
              }
              onClick={() => toggleOnItem(router, 'tab', id)}
            >
              <span>{name}</span>
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        <Tabs.Content value="portfolio" className="col-span-full">
          <UserTokensTable
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
              collectionId,
              setToast,
              signer,
            }}
          />
          {/* <UserTokensGrid data={userTokens} /> */}
        </Tabs.Content>
        <Tabs.Content value="history" className="col-span-full">
          {/* <UserActivityTable
            data={userActivity}
            CHAIN_ID={+CHAIN_ID as CHAIN_ID}
          /> */}
        </Tabs.Content>
        {isOwner && (
          <>
            <Tabs.Content value="buying" className="col-span-full">
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
                  collectionId,
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
                  collectionId,
                  setToast,
                  signer,
                }}
              />
            </Tabs.Content>
          </>
        )}
      </Tabs.Root>
    </Layout>
  )
}

export default Address

export const getServerSideProps: GetServerSideProps<{
  mode: ReturnType<typeof getMode>['mode']
  collectionId: string
}> = async ({ req }) => {
  const options: RequestInit | undefined = {}

  if (RESERVOIR_API_KEY) {
    options.headers = {
      'x-api-key': RESERVOIR_API_KEY,
    }
  }

  let { collectionId, mode } = getMode(req, USE_WILDCARD, COMMUNITY, COLLECTION)

  if (mode === 'collection') {
    const url = new URL('/collection/v1', RESERVOIR_API_BASE)

    const query: paths['/collection/v1']['get']['parameters']['query'] = {
      id: collectionId,
    }

    const href = setParams(url, query)

    const res = await fetch(href, options)

    const json =
      (await res.json()) as paths['/collection/v1']['get']['responses']['200']['schema']

    if (!json.collection?.id) {
      return {
        notFound: true,
      }
    }

    collectionId = json.collection?.id
  }

  return { props: { collectionId, mode } }
}
