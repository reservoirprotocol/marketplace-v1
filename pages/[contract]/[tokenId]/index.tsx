import Layout from 'components/Layout'
import { paths } from 'interfaces/apiTypes'
import fetcher from 'lib/fetcher'
import { optimizeImage } from 'lib/optmizeImage'
import setParams from 'lib/params'
import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from 'next'
import { useRouter } from 'next/router'
import EthAccount from 'components/EthAccount'
import useSWR from 'swr'
import { FC, ReactNode, useState } from 'react'
import { useAccount, useNetwork, useSigner } from 'wagmi'
import ListModal from 'components/ListModal'
import OfferModal from 'components/OfferModal'
import { acceptOffer } from 'lib/acceptOffer'
import { instantBuy } from 'lib/buyToken'
import cancelOrder from 'lib/cancelOrder'
import FormatEth from 'components/FormatEth'

const apiBase = process.env.NEXT_PUBLIC_API_BASE
const chainId = process.env.NEXT_PUBLIC_CHAIN_ID
const openSeaApiKey = process.env.NEXT_PUBLIC_OPENSEA_API_KEY

type Props = InferGetServerSidePropsType<typeof getServerSideProps>

const Index: NextPage<Props> = ({ wildcard, isHome }) => {
  const [{ data: accountData }] = useAccount()
  const [{ data: signer }] = useSigner()
  const [waitingTx, setWaitingTx] = useState<boolean>(false)
  const [{ data: network }] = useNetwork()
  const router = useRouter()

  let url = new URL('/tokens/details', apiBase)

  let query: paths['/tokens/details']['get']['parameters']['query'] = {
    contract: router.query?.contract?.toString(),
    tokenId: router.query?.tokenId?.toString(),
  }

  setParams(url, query)

  const details = useSWR<
    paths['/tokens/details']['get']['responses']['200']['schema']
  >(url.href, fetcher)

  let collectionUrl = new URL(`/collections/${wildcard}`, apiBase)

  const collection = useSWR<
    paths['/collections/{collection}']['get']['responses']['200']['schema']
  >(collectionUrl.href, fetcher)

  if (details.error || !apiBase || !chainId || !openSeaApiKey) {
    console.debug({ apiBase }, { chainId })
    return <div>There was an error</div>
  }

  const token = details.data?.tokens?.[0]
  const isOwner =
    token?.token?.owner?.toLowerCase() === accountData?.address.toLowerCase()
  const isTopBidder =
    token?.market?.topBuy?.maker?.toLowerCase() ===
    accountData?.address.toLowerCase()
  const isInTheWrongNetwork = signer && network.chain?.id !== +chainId

  const layoutData = {
    title: isHome
      ? token?.token?.collection?.name
      : collection.data?.collection?.collection?.name,
    image: isHome ? undefined : collection.data?.collection?.collection?.image,
  }
  return (
    <Layout title={layoutData.title} image={layoutData.image}>
      <div className="mt-8 grid grid-cols-2 justify-items-center gap-10">
        <img
          className="w-[500px]"
          src={optimizeImage(token?.token?.image, 500)}
        />
        <div>
          <div className="mb-4 text-lg">{token?.token?.collection?.name}</div>
          <div className="mb-3 text-xl font-bold">{token?.token?.name}</div>
          <div className="mb-10">
            {token?.token?.owner && <EthAccount address={token.token.owner} />}
          </div>
          <div className="rounded-md bg-white p-5 shadow-md">
            <div className="grid grid-cols-2 gap-8">
              <Price
                title="list price"
                price={
                  <FormatEth
                    amount={token?.market?.floorSell?.value}
                    maximumFractionDigits={4}
                    logoWidth={12}
                  />
                }
              >
                {isOwner ? (
                  <ListModal
                    apiBase={apiBase}
                    chainId={+chainId}
                    signer={signer}
                    maker={accountData?.address}
                    collection={collection.data}
                    tokens={details.data}
                    mutate={details.mutate}
                  />
                ) : (
                  <button
                    disabled={
                      !signer ||
                      token?.market?.floorSell?.value === null ||
                      waitingTx ||
                      isInTheWrongNetwork
                    }
                    onClick={async () => {
                      const tokenId = token?.token?.tokenId
                      const contract = token?.token?.contract

                      if (!signer || !tokenId || !contract) {
                        console.debug({ tokenId, signer, contract })
                        return
                      }

                      const query: paths['/orders/fill']['get']['parameters']['query'] =
                        {
                          contract,
                          tokenId,
                          side: 'sell',
                        }

                      try {
                        setWaitingTx(true)
                        await instantBuy(
                          apiBase,
                          +chainId as 1 | 4,
                          signer,
                          query
                        )
                        await details.mutate()
                        setWaitingTx(false)
                      } catch (error) {
                        setWaitingTx(false)
                        console.error(error)
                        return
                      }
                    }}
                    className="btn-blue-fill w-full"
                  >
                    {waitingTx ? 'Waiting...' : 'Buy Now'}
                  </button>
                )}
              </Price>
              <Price
                title="top offer"
                price={
                  <FormatEth
                    amount={token?.market?.topBuy?.value}
                    maximumFractionDigits={4}
                    logoWidth={12}
                  />
                }
              >
                {isOwner ? (
                  <button
                    disabled={
                      waitingTx ||
                      !token?.market?.topBuy?.value ||
                      isInTheWrongNetwork
                    }
                    onClick={async () => {
                      const tokenId = token?.token?.tokenId
                      const contract = token?.token?.contract

                      if (!tokenId || !contract || !signer) {
                        console.debug({ tokenId, contract, signer })
                        return
                      }

                      const query: Parameters<typeof acceptOffer>[3] = {
                        tokenId,
                        contract,
                        side: 'buy',
                      }

                      try {
                        setWaitingTx(true)
                        await acceptOffer(
                          apiBase,
                          +chainId as 1 | 4,
                          signer,
                          query
                        )
                        await details.mutate()
                        setWaitingTx(false)
                      } catch (error) {
                        setWaitingTx(false)
                        console.error(error)
                      }
                    }}
                    className="btn-green-fill w-full"
                  >
                    {waitingTx ? 'Waiting...' : 'Accept Offer'}
                  </button>
                ) : (
                  <OfferModal
                    signer={signer}
                    data={{
                      // SINGLE TOKEN OFFER
                      collection: {
                        id: undefined,
                        image: undefined,
                        name: collection.data?.collection?.collection?.name,
                        tokenCount: undefined,
                      },
                      token: {
                        contract: token?.token?.contract,
                        id: token?.token?.tokenId,
                        image: token?.token?.image,
                        name: token?.token?.name,
                        topBuyValue: token?.market?.topBuy?.value,
                        floorSellValue: token?.market?.floorSell?.value,
                      },
                    }}
                    royalties={{
                      bps: collection.data?.collection?.royalties?.bps,
                      recipient:
                        collection.data?.collection?.royalties?.recipient,
                    }}
                    env={{
                      apiBase,
                      chainId: +chainId,
                      openSeaApiKey,
                    }}
                    mutate={details.mutate}
                  />
                )}
              </Price>
            </div>
            {signer && isTopBidder && (
              <button
                disabled={waitingTx || isInTheWrongNetwork}
                onClick={async () => {
                  const tokenId = token?.token?.tokenId
                  const contract = token?.token?.contract
                  if (tokenId && contract) {
                    const query: Parameters<typeof cancelOrder>[3] = {
                      contract,
                      tokenId,
                      side: 'buy',
                    }

                    try {
                      setWaitingTx(true)
                      await cancelOrder(
                        apiBase,
                        +chainId as 1 | 4,
                        signer,
                        query
                      )
                      await details.mutate()
                      setWaitingTx(false)
                    } catch (error) {
                      setWaitingTx(false)
                      console.error(error)
                    }
                  }
                }}
                className="btn-red-ghost col-span-2 mx-auto mt-8"
              >
                {waitingTx ? 'Waiting...' : 'Cancel your offer'}
              </button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Index

const Price: FC<{ title: string; price: ReactNode }> = ({
  title,
  price,
  children,
}) => (
  <div className="grid justify-items-center space-y-5">
    <div className="text-center font-medium uppercase opacity-75">{title}</div>
    <div className="text-3xl font-bold">{price}</div>
    {children}
  </div>
)

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
