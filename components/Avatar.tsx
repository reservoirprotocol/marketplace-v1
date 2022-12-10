import { FC } from 'react'
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon'

type Props = {
  address: string | undefined
  avatar?: string | null | undefined
  size?: number
}

const Avatar: FC<Props> = ({ address, avatar, size = 24 }) => {
  return (
    <div
      className="overflow-hidden rounded-full border-2 border-primary-900/75"
      style={{
        height: size,
        width: size,
      }}
    >
      <img
        className="object-fit h-full w-full"
        src={avatar || "https://cdn.finiliar.com/website/fini-face.png"}
        alt={'ENS Avatar'}
      />
    </div>
  )
}

export default Avatar
