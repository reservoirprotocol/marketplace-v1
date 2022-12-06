import ConnectWalletButton from 'components/ConnectWalletButton'
import Layout from 'components/Layout'
import SellTable from 'components/tables/SellTable'
import { NextPage } from 'next'
import { useAccount } from 'wagmi'
import Toast from 'components/Toast'
import toast from 'react-hot-toast'
import { ComponentProps } from 'react'

const Sell: NextPage = () => {
  const { address, isConnected } = useAccount()

  const setToast: (data: ComponentProps<typeof Toast>['data']) => any = (
    data
  ) => toast.custom((t) => <Toast t={t} toast={toast} data={data} />)

  return (
    <Layout navbar={{}}>
      <div className="item-center col-span-full mx-auto flex w-screen max-w-[1500px] flex-col px-4 py-8 sm:px-12 md:py-16">
        {isConnected ? (
          <>
            <h1 className="mb-11 text-[32px] font-semibold">Sell your items</h1>
            <SellTable
              isOwner={false}
              address={address}
              modal={{
                isInTheWrongNetwork: undefined,
                setToast,
              }}
            />
          </>
        ) : (
          <div className="flex flex-col items-center gap-y-6 py-16 text-center md:py-32">
            <h3 className="mb-2 text-2xl font-semibold dark:text-white sm:text-3xl">
              Sell your NFTs instantly
            </h3>
            <img src="/sell_graphic.svg" alt="" className="dark:hidden" />
            <img
              src="/sell_graphic_dark.svg"
              alt=""
              className="hidden dark:block"
            />
            <p className="max-w-[310px] dark:text-white">
              Connect wallet to accept the best offers from all major
              marketplaces.
            </p>
            <ConnectWalletButton>
              <span className="w-40">Connect Wallet</span>
            </ConnectWalletButton>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default Sell
