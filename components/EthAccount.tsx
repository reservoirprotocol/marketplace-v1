import { FC, useEffect, useState } from 'react'
import blockies from 'ethereum-blockies'

/**
 * Ensure that an Ethereum address does not overflow
 * by removing the middle characters
 * @param address An Ethereum address
 * @returns A shrinked version of the Ethereum address
 * with the middle characters removed.
 */
export function shrinkAddress(address: string | undefined) {
  if (!address) return '-'
  return `${address.slice(0, 4)}…${address.slice(-4)}`
}

/**
 * Ensure the ENS names do not overflow by removing the
 * middle characters
 * @param ensName An ENS name
 * @returns A shrinked version of the ENS name if and
 * and only if the ENS name is longer than 24 characters
 * such that the displayed string does not overflow
 */
function shrinkEns(ensName: string) {
  if (ensName.length > 24) {
    return `${ensName.slice(0, 20)}…${ensName.slice(-3)}`
  }
  return ensName
}

type Props = {
  address: string | undefined
  ens?: {
    avatar: string | null | undefined
    name: string | null | undefined
  }
}

const EthAccount: FC<Props> = ({ address, ens }) => {
  const isBrowser = typeof window !== 'undefined'
  const [dataUrl, setDataUrl] = useState('')

  useEffect(() => {
    if (dataUrl === '' && isBrowser) {
      setDataUrl(
        blockies
          .create({
            seed: address,
          })
          .toDataURL()
      )
    }
  }, [isBrowser])

  const blockie = (
    <img className="h-[32px] w-[32px] rounded-full" src={dataUrl} />
  )

  return (
    <div className="flex items-center gap-2">
      <>
        {ens?.avatar ? (
          <img
            className="h-[32px] w-[32px] rounded-full"
            src={ens.avatar}
            alt="ENS Avatar"
          />
        ) : (
          blockie
        )}
        {ens?.name ? (
          <span title={address}>{shrinkEns(ens.name)}</span>
        ) : (
          <span className="font-mono lowercase" title={address}>
            {shrinkAddress(address)}
          </span>
        )}
      </>
    </div>
  )
}

export default EthAccount
