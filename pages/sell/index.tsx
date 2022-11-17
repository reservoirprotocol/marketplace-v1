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

const Sell: NextPage = () => {
  return (
    <Layout navbar={{}}>
      {/* <Head></Head> */}
      <div>
        <h1>Sell your items</h1>
      </div>
    </Layout>
  )
}

export default Sell
