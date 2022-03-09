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
import useUserActivity from 'hooks/useUserActivity'
import useUserPositions from 'hooks/useUserPositions'
import UserOffersTable from 'components/tables/UserOffersTable'
import UserListingsTable from 'components/tables/UserListingsTable'
import UserActivityTable from 'components/tables/UserActivityTable'
import UserTokensTable from 'components/tables/UserTokensTable'
import { ComponentProps } from 'react'
import Toast from 'components/Toast'
import toast from 'react-hot-toast'
import Head from 'next/head'

// Environment variables
// For more information about these variables
// refer to the README.md file on this repository
// Reference: https://nextjs.org/docs/basic-features/environment-variables#exposing-environment-variables-to-the-browser
// REQUIRED
const chainId = process.env.NEXT_PUBLIC_CHAIN_ID
const apiBase = process.env.NEXT_PUBLIC_API_BASE

// OPTIONAL
const collectionEnv = process.env.NEXT_PUBLIC_COLLECTION
const communityEnv = process.env.NEXT_PUBLIC_COMMUNITY

type Props = InferGetServerSidePropsType<typeof getServerSideProps>

const Address: NextPage<Props> = ({ mode, collectionId }) => {
  const [{ data: accountData }] = useAccount()
  const [{ data: network }] = useNetwork()
  const [{ data: signer }] = useSigner()
  const router = useRouter()
  useDataDog(accountData)
  const address = router.query?.address?.toString()?.toLowerCase()
  const userTokens = useUserTokens(apiBase, collectionId, [], mode, address)
  const userActivity = useUserActivity(apiBase, [], address)
  const sellPositions = useUserPositions(apiBase, [], 'sell', address)
  const buyPositions = useUserPositions(apiBase, [], 'buy', address)

  if (!apiBase || !chainId) {
    console.debug({ apiBase, chainId })
    return <div>There was an error</div>
  }

  const setToast: (data: ComponentProps<typeof Toast>['data']) => any = (
    data
  ) => toast.custom((t) => <Toast t={t} toast={toast} data={data} />)

  const isInTheWrongNetwork = network.chain?.id !== +chainId
  const isOwner = address?.toLowerCase() === accountData?.address?.toLowerCase()

  let tabs = [
    { name: 'Portfolio', id: 'portfolio' },
    { name: 'History', id: 'history' },
  ]

  if (isOwner) {
    tabs = [
      { name: 'Portfolio', id: 'portfolio' },
      { name: 'Buying', id: 'buying' },
      { name: 'Selling', id: 'selling' },
      { name: 'History', id: 'history' },
    ]
  }

  return (
    <Layout>
      <Head>
        <title>{address} Profile | Reservoir Market</title>
      </Head>
      <div className="mt-4 mb-10 flex items-center justify-center">
        {address && <EthAccount address={address} />}
      </div>
      <Tabs.Root value={router.query?.tab?.toString() || 'portfolio'}>
        <Tabs.List className="mb-3 flex justify-center gap-4 md:mb-4 lg:mb-5">
          <nav className="flex overflow-hidden rounded-lg shadow">
            {tabs.map(({ name, id }) => (
              <Tabs.Trigger
                key={id}
                id={id}
                value={id}
                className={
                  'group reservoir-label-l relative min-w-0 overflow-hidden  whitespace-nowrap border-b-2 border-transparent bg-white py-4 px-12 text-center hover:bg-gray-50 hover:text-gray-700 focus:z-10 radix-state-active:border-black radix-state-active:text-gray-900'
                }
                onClick={() => toggleOnItem(router, 'tab', id)}
              >
                <span>{name}</span>
              </Tabs.Trigger>
            ))}
          </nav>
        </Tabs.List>
        <Tabs.Content value="portfolio">
          <UserTokensTable
            data={userTokens}
            mutate={() => {
              buyPositions.positions.mutate()
              userTokens.tokens.mutate()
              userActivity.transfers.mutate()
              sellPositions.positions.mutate()
            }}
            isOwner={isOwner}
            modal={{
              accountData,
              apiBase,
              isInTheWrongNetwork,
              collectionId,
              setToast,
              signer,
            }}
          />
          {/* <UserTokensGrid data={userTokens} /> */}
        </Tabs.Content>
        <Tabs.Content value="history">
          <UserActivityTable
            data={userActivity}
            chainId={+chainId as ChainId}
          />
        </Tabs.Content>
        {isOwner && (
          <>
            <Tabs.Content value="buying">
              <UserOffersTable
                data={buyPositions}
                mutate={() => {
                  buyPositions.positions.mutate()
                  userTokens.tokens.mutate()
                }}
                isOwner={isOwner}
                maker={address || ''}
                modal={{
                  accountData,
                  apiBase,
                  isInTheWrongNetwork,
                  collectionId,
                  setToast,
                  signer,
                }}
              />
            </Tabs.Content>
            <Tabs.Content value="selling">
              <UserListingsTable
                data={sellPositions}
                mutate={() => {
                  userTokens.tokens.mutate()
                  sellPositions.positions.mutate()
                }}
                isOwner={isOwner}
                maker={address || ''}
                modal={{
                  accountData,
                  apiBase,
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
  mode: string
  collectionId: string
}> = async ({ req }) => {
  const { collectionId, mode } = getMode(req, communityEnv, collectionEnv)

  return { props: { collectionId, mode } }
}
