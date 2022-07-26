import { FC, useContext, useState } from 'react'
import LoadingCard from './LoadingCard'
import { SWRInfiniteResponse } from 'swr/infinite/dist/infinite'
import Link from 'next/link'
import { optimizeImage } from 'lib/optmizeImage'
import { useInView } from 'react-intersection-observer'
import FormatEth from './FormatEth'
import Masonry from 'react-masonry-css'
import { paths } from '@reservoir0x/reservoir-kit-client'
import { Execute } from '@reservoir0x/reservoir-kit-client'
import Image from 'next/image'
import { FaShoppingCart } from 'react-icons/fa'
import { atom, useRecoilState, useRecoilValue } from 'recoil'
import { recoilCartTotal, recoilTokensMap } from './CartMenu'
import { setToast } from './token/setToast'
import { useNetwork, useSigner, useSwitchNetwork } from 'wagmi'
import { GlobalContext } from 'context/GlobalState'
import { useReservoirClient } from '@reservoir0x/reservoir-kit-ui'

const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID
const SOURCE_ID = process.env.NEXT_PUBLIC_SOURCE_ID
const NAVBAR_LOGO = process.env.NEXT_PUBLIC_NAVBAR_LOGO
const SOURCE_ICON = process.env.NEXT_PUBLIC_SOURCE_ICON

type Props = {
  tokens: SWRInfiniteResponse<
    paths['/tokens/v4']['get']['responses']['200']['schema'],
    any
  >
  collectionImage: string | undefined
  viewRef: ReturnType<typeof useInView>['ref']
}

type Tokens = NonNullable<
  paths['/tokens/v4']['get']['responses']['200']['schema']['tokens']
>

export const recoilCartTokens = atom<Tokens>({
  key: 'cartTokens',
  default: [],
})

const TokensGrid: FC<Props> = ({ tokens, viewRef, collectionImage }) => {
  const [cartTokens, setCartTokens] = useRecoilState(recoilCartTokens)
  const tokensMap = useRecoilValue(recoilTokensMap)
  const [waitingTx, setWaitingTx] = useState(false)
  const { data: signer } = useSigner()
  const [open, setOpen] = useState(false)
  const { dispatch } = useContext(GlobalContext)
  const cartTotal = useRecoilValue(recoilCartTotal)
  const [steps, setSteps] = useState<Execute['steps']>()
  const { chain: activeChain } = useNetwork()
  const reservoirClient = useReservoirClient()
  const { switchNetworkAsync } = useSwitchNetwork({
    chainId: CHAIN_ID ? +CHAIN_ID : undefined,
  })
  const { data, error } = tokens

  // Reference: https://swr.vercel.app/examples/infinite-loading
  const mappedTokens = data ? data.flatMap(({ tokens }) => tokens) : []
  const isLoadingInitialData = !data && !error
  const didReachEnd =
    data &&
    (data[data.length - 1]?.tokens?.length === 0 ||
      data[data.length - 1]?.continuation === null)

  type TokenData = {
    contract: string
    tokenId: string
  }

  if (!CHAIN_ID) return null

  const isInTheWrongNetwork = Boolean(signer && activeChain?.id !== +CHAIN_ID)

  const execute = async (token: TokenData, expectedPrice: number) => {
    setWaitingTx(true)
    if (!signer) {
      throw 'Missing a signer'
    }

    if (!reservoirClient) throw 'Client not started'

    await reservoirClient.actions
      .buyToken({
        expectedPrice,
        tokens: [token],
        signer,
        onProgress: setSteps,
      })
      .then(() => tokens.mutate())
      .catch((err: any) => {
        if (err?.type === 'price mismatch') {
          setToast({
            kind: 'error',
            message: 'Price was greater than expected.',
            title: 'Could not buy token',
          })
          return
        }

        if (err?.message === 'Not enough ETH balance') {
          setToast({
            kind: 'error',
            message: 'You have insufficient funds to buy this token.',
            title: 'Not enough ETH balance',
          })
          return
        }
        // Handle user rejection
        if (err?.code === 4001) {
          setOpen(false)
          setSteps(undefined)
          setToast({
            kind: 'error',
            message: 'You have canceled the transaction.',
            title: 'User canceled transaction',
          })
          return
        }
        setToast({
          kind: 'error',
          message: 'The transaction was not completed.',
          title: 'Could not buy token',
        })
      })

    setWaitingTx(false)
  }

  return (
    <Masonry
      key="tokensGridMasonry"
      breakpointCols={{
        default: 6,
        1900: 5,
        1536: 4,
        1280: 3,
        1024: 2,
        768: 2,
        640: 2,
        500: 1,
      }}
      className="masonry-grid"
      columnClassName="masonry-grid_column"
    >
      {isLoadingInitialData
        ? Array(10)
            .fill(null)
            .map((_, index) => <LoadingCard key={`loading-card-${index}`} />)
        : mappedTokens?.map((token, idx) => {
            const isInCart = Boolean(
              tokensMap[`${token?.contract}:${token?.tokenId}`]
            )
            if (!token) return null
            return (
              <div
                key={`${token.contract}${token.tokenId}`}
                className="group relative mb-6 grid transform-gpu self-start overflow-hidden rounded-[16px] border border-[#D4D4D4] bg-white transition ease-in hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-lg hover:ease-out dark:border-0 dark:bg-neutral-800 dark:ring-1 dark:ring-neutral-600"
              >
                {isInCart ? (
                  <div className="absolute top-4 right-4 z-10 flex h-[34px] w-[34px] items-center justify-center overflow-hidden rounded-full bg-primary-700">
                    <FaShoppingCart className="h-[18px] w-[18px] text-white" />
                  </div>
                ) : null}

                <Link
                  key={`${token?.collection?.name}${idx}`}
                  href={`/${token?.contract}/${token?.tokenId}`}
                >
                  <a className="mb-[85px]">
                    {token?.image ? (
                      <Image
                        loader={({ src }) => src}
                        src={optimizeImage(token?.image, 250)}
                        alt={`${token?.name}`}
                        className="w-full"
                        width={250}
                        height={250}
                        objectFit="cover"
                      />
                    ) : (
                      <div className="relative w-full">
                        <div className="absolute inset-0 grid place-items-center backdrop-blur-lg">
                          <div>
                            <img
                              src={optimizeImage(collectionImage, 250)}
                              alt={`${token?.collection?.name}`}
                              className="mx-auto mb-4 h-16 w-16 overflow-hidden rounded-full border-2 border-white"
                              width="64"
                              height="64"
                            />
                            <div className="reservoir-h6 text-white">
                              No Content Available
                            </div>
                          </div>
                        </div>
                        <img
                          src={optimizeImage(collectionImage, 250)}
                          alt={`${token?.collection?.name}`}
                          className="aspect-square w-full object-cover"
                          width="250"
                          height="250"
                        />
                      </div>
                    )}
                  </a>
                </Link>
                <div className="absolute -bottom-[41px] w-full  bg-white transition-all group-hover:bottom-[0px] dark:bg-neutral-800">
                  <div
                    className="reservoir-subtitle mb-3 overflow-hidden truncate px-4 pt-4 dark:text-white lg:pt-3"
                    title={token?.name || token?.tokenId}
                  >
                    {token?.name || `#${token?.tokenId}`}
                  </div>
                  <div className="flex items-center justify-between px-4 pb-4 lg:pb-3">
                    <div className="reservoir-h6">
                      <FormatEth amount={token?.floorAskPrice} logoWidth={7} />
                    </div>
                    <div className="text-right">
                      {token?.source && (
                        <img
                          className="h-6 w-6"
                          src={
                            SOURCE_ID &&
                            token?.source &&
                            SOURCE_ID === token?.source
                              ? SOURCE_ICON || NAVBAR_LOGO
                              : `https://api.reservoir.tools/redirect/logo/v1?source=${token?.source}`
                          }
                          alt=""
                        />
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2">
                    <button
                      disabled={
                        waitingTx ||
                        !token?.floorAskPrice ||
                        (isInTheWrongNetwork && !switchNetworkAsync)
                      }
                      onClick={async () => {
                        if (
                          isInTheWrongNetwork &&
                          switchNetworkAsync &&
                          CHAIN_ID
                        ) {
                          const chain = await switchNetworkAsync(+CHAIN_ID)
                          if (chain.id !== +CHAIN_ID) {
                            return false
                          }
                        }

                        if (token.floorAskPrice) {
                          if (!signer) {
                            dispatch({ type: 'CONNECT_WALLET', payload: true })
                            return
                          }
                          execute(
                            {
                              contract: token.contract,
                              tokenId: token.tokenId,
                            },
                            token.floorAskPrice
                          )
                        }
                      }}
                      className="btn-primary-fill reservoir-subtitle flex h-[40px] items-center justify-center whitespace-nowrap rounded-none text-white"
                    >
                      Buy Now
                    </button>
                    {isInCart ? (
                      <button
                        onClick={() => {
                          const newCartTokens = [...cartTokens]
                          const index = newCartTokens.findIndex(
                            ({ contract, tokenId }) =>
                              contract === token?.contract &&
                              tokenId === token.tokenId
                          )
                          newCartTokens.splice(index, 1)
                          setCartTokens(newCartTokens)
                        }}
                        className="reservoir-subtitle flex h-[40px] items-center justify-center border-t border-neutral-300 text-[#FF3B3B] disabled:cursor-not-allowed dark:border-neutral-600 dark:text-red-300"
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        disabled={!token?.floorAskPrice || isInTheWrongNetwork}
                        onClick={() => {
                          setCartTokens([...cartTokens, token])
                        }}
                        className="reservoir-subtitle flex h-[40px] items-center justify-center border-t border-neutral-300 disabled:cursor-not-allowed dark:border-neutral-600"
                      >
                        Add to Cart
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
      {!didReachEnd &&
        Array(10)
          .fill(null)
          .map((_, index) => {
            if (index === 0) {
              return (
                <LoadingCard viewRef={viewRef} key={`loading-card-${index}`} />
              )
            }
            return <LoadingCard key={`loading-card-${index}`} />
          })}
    </Masonry>
  )
}

export default TokensGrid
