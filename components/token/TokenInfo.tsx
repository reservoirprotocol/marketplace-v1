import useEnvChain from 'hooks/useEnvChain'
import { truncateAddress } from 'lib/truncateText'
import React, { FC, useState } from 'react'
import { FiExternalLink, FiRefreshCcw } from 'react-icons/fi'
import { TokenDetails } from 'types/reservoir'
import { setToast } from './setToast'

const PROXY_API_BASE = process.env.NEXT_PUBLIC_PROXY_API_BASE

type Props = {
  token?: TokenDetails
}

const TokenInfo: FC<Props> = ({ token }) => {
  const [refreshLoading, setRefreshLoading] = useState(false)
  const envChain = useEnvChain()

  const blockExplorerBaseUrl =
    envChain?.blockExplorers?.default?.url || 'https://etherscan.io'

  async function refreshToken(token: string | undefined) {
    function handleError(message?: string) {
      setToast({
        kind: 'error',
        message: message || 'Request to refresh this token was rejected.',
        title: 'Refresh token failed',
      })

      setRefreshLoading(false)
    }

    try {
      if (!token) throw new Error('No token')

      const data = {
        token,
      }

      const pathname = `${PROXY_API_BASE}/tokens/refresh/v1`

      setRefreshLoading(true)

      const res = await fetch(pathname, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const json = await res.json()
        handleError(json?.message)
        return
      }

      setToast({
        kind: 'success',
        message: 'Request to refresh this token was accepted.',
        title: 'Refresh token',
      })
    } catch (err) {
      handleError()
      console.error(err)
      return
    }

    setRefreshLoading(false)
  }

  return (
    <article className="col-span-full rounded-2xl border border-gray-300 bg-white p-6 dark:border-neutral-600 dark:bg-black">
      <div className="mb-4 flex items-center justify-between">
        <div className="reservoir-h5 font-headings dark:text-white">
          Token Info
        </div>
        <div className="flex items-center gap-2">
          <a
            className="reservoir-h6 font-headings"
            target="_blank"
            rel="noopener noreferrer"
            href={`https://looksrare.org/collections/${token?.contract}/${token?.tokenId}`}
          >
            <img
              src="/icons/LooksRare.svg"
              alt="LooksRare Icon"
              className="h-6 w-6"
            />
          </a>
          <a
            className="reservoir-h6 font-headings"
            target="_blank"
            rel="noopener noreferrer"
            href={`https://opensea.io/assets/${token?.contract}/${token?.tokenId}`}
          >
            <img
              src="/icons/OpenSea.svg"
              alt="OpenSea Icon"
              className="h-6 w-6"
            />
          </a>
        </div>
      </div>
      {token?.contract && (
        <div className="mb-4 flex items-center justify-between">
          <div className="reservoir-subtitle dark:text-white">
            Contract Address
          </div>
          <div>
            <a
              className="reservoir-h6 flex items-center gap-2 font-headings text-primary-700 dark:text-primary-100"
              target="_blank"
              rel="noopener noreferrer"
              href={`${blockExplorerBaseUrl}/address/${token?.contract}`}
            >
              {truncateAddress(token?.contract)}
              <FiExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      )}
      <div className="mb-4 flex items-center justify-between">
        <div className="reservoir-subtitle dark:text-white">Token ID</div>
        <div className="reservoir-h6 max-w-[80px] truncate font-headings dark:text-white">
          {token?.tokenId}
        </div>
      </div>
      <div className="mb-4 flex items-center justify-between">
        <div className="reservoir-subtitle dark:text-white">Token Standard</div>
        <div className="reservoir-h6 font-headings uppercase dark:text-white">
          {token?.kind}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="reservoir-subtitle dark:text-white">
          Metadata Refresh
        </div>
        <button
          className="btn-primary-outline reservoir-h6 ml-auto flex items-center gap-2 p-2 font-headings text-primary-700 dark:border-neutral-600 dark:text-primary-100 dark:ring-primary-900 dark:focus:ring-4"
          title="Refresh token"
          disabled={refreshLoading}
          onClick={() => refreshToken(`${token?.contract}:${token?.tokenId}`)}
        >
          Refresh{' '}
          <FiRefreshCcw
            className={`h-4 w-4 ${
              refreshLoading ? 'animate-spin-reverse' : ''
            }`}
          />
        </button>
      </div>
    </article>
  )
}

export default TokenInfo
