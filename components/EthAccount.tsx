import { truncateAddress, truncateEns } from 'lib/truncateText'
import { FC } from 'react'
import Avatar from './Avatar'

type Props = {
  address: string | undefined
  ens?: {
    avatar: string | null | undefined
    name: string | null | undefined
  }
  title?: string
  side?: 'left' | 'right'
  hideIcon?: boolean
}

const EthAccount: FC<Props> = ({
  address,
  ens,
  title,
  side = 'right',
  hideIcon,
}) => {
  const icon = !hideIcon && <Avatar address={address} avatar={ens?.avatar} />

  return (
    <div className="flex items-center gap-2">
      {title && (
        <p className="reservoir-label-l capitalize text-gray-400 dark:text-white">
          {title}
        </p>
      )}
      {side === 'left' && icon}
      {ens?.name ? (
        <div title={address} className="dark:text-white">
          {truncateEns(ens.name)}
        </div>
      ) : (
        <div
          className="reservoir-label-l block whitespace-nowrap font-mono dark:text-white"
          title={address}
        >
          {truncateAddress(address || '')}
        </div>
      )}
      {side === 'right' && icon}
    </div>
  )
}

export default EthAccount
