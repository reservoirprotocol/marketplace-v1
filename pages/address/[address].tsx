import Layout from 'components/Layout'
import { NextPage } from 'next'
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
import UserOffersTable from 'components/tables/UserOffersTable'
import UserListingsTable from 'components/tables/UserListingsTable'
import UserTokensGrid from 'components/UserTokensGrid'
import Avatar from 'components/Avatar'
import { ComponentProps } from 'react'
import Toast from 'components/Toast'
import toast from 'react-hot-toast'
import Head from 'next/head'
import useUserAsks from 'hooks/useUserAsks'
import { useUserTokens, useBids } from '@reservoir0x/reservoir-kit-ui'
import useSearchCommunity from 'hooks/useSearchCommunity'
import { truncateAddress } from 'lib/truncateText'

const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID
const COLLECTION = process.env.NEXT_PUBLIC_COLLECTION
const COMMUNITY = process.env.NEXT_PUBLIC_COMMUNITY
const COLLECTION_SET_ID = process.env.NEXT_PUBLIC_COLLECTION_SET_ID

const metadata = {
  title: (title: string) => <title>{title}</title>,
}

const Address: NextPage = () => {
  const router = useRouter()
  const accountData = useAccount()
  const address = router.query.address as string

  if (!address) {
    throw 'No address set'
  }

  const { data: ensAvatar } = useEnsAvatar({
    addressOrName: address,
  })

  const { data: ensName } = useEnsName({
    address,
    onSettled(data, error) {
      console.log('Settled', { data, error })
    },
    onError(error) {
      console.log('Error', error)
    },
  })
  const { chain: activeChain } = useNetwork()
  const { data: signer } = useSigner()
  const userTokensParams: Parameters<typeof useUserTokens>['1'] = {
    limit: 20,
    includeTopBid: true,
  }
  if (COLLECTION_SET_ID) {
    userTokensParams.collectionsSetId = COLLECTION_SET_ID
  } else {
    if (COMMUNITY) userTokensParams.community = COMMUNITY
  }

  if (COLLECTION && (!COMMUNITY || !COLLECTION_SET_ID)) {
    userTokensParams.collection = COLLECTION
  }
  const userTokens = useUserTokens(address, userTokensParams)
  const collections = useSearchCommunity()
  const listings = useUserAsks(address, collections)
  const params: Parameters<typeof useBids>[0] = {
    status: 'active',
    maker: address,
    limit: 20,
    includeMetadata: true,
  }
  if (COLLECTION && !COMMUNITY && !COLLECTION_SET_ID) {
    params.contracts = [COLLECTION]
  }

  if (COMMUNITY || COLLECTION_SET_ID) {
    collections?.data?.collections
      ?.map(({ contract }) => contract)
      .filter((contract) => !!contract)
      .forEach(
        // @ts-ignore
        (contract, index) => (params[`contracts[${index}]`] = contract)
      )
  }
  const bidsResponse = useBids(params)

  if (!CHAIN_ID) {
    console.debug({ CHAIN_ID })
    return <div>There was an error</div>
  }

  const setToast: (data: ComponentProps<typeof Toast>['data']) => any = (
    data
  ) => toast.custom((t) => <Toast t={t} toast={toast} data={data} />)

  const isInTheWrongNetwork = activeChain?.id !== +CHAIN_ID
  const isOwner = address?.toLowerCase() === accountData?.address?.toLowerCase()
  const formattedAddress = truncateAddress(address as string)

  let tabs = [{ name: 'Portfolio', id: 'portfolio' }]

  if (isOwner) {
    tabs = [
      { name: 'Tokens', id: 'portfolio' },
      { name: 'Offers', id: 'buying' },
      { name: 'Listings', id: 'selling' },
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
                  userTokens={userTokens}
                  mutate={() => {
                    userTokens.mutate()
                    bidsResponse.mutate()
                    listings.mutate()
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
            </Tabs.Content>
            {isOwner && (
              <>
                <Tabs.Content value="buying">
                  <UserOffersTable
                    data={bidsResponse}
                    mutate={() => {
                      userTokens.mutate()
                      bidsResponse.mutate()
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
                </Tabs.Content>
                <Tabs.Content value="selling" className="col-span-full">
                  <UserListingsTable
                    data={listings}
                    mutate={() => {
                      userTokens.mutate()
                      listings.mutate()
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
