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
  let collectionIds: undefined | string[] = undefined

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
            <img
              src="/icons/wallet-dark.svg"
              alt="Wallet icon"
              className="h-8 w-8"
            />
            <p>Connect wallet to sell your items</p>
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
