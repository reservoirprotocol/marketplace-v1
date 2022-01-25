import { FC } from 'react'
import ConnectWallet from './ConnectWallet'
import Link from 'next/link'

type Props = {
  title: string | undefined
  image: string | undefined
}

const Navbar: FC<Props> = ({ title, image }) => {
  return (
    <nav className="flex items-center justify-between">
      <Link href="/">
        <a className="flex items-center justify-between gap-3">
          {image ? (
            <img src={image} alt={title} className="w-[30px]" />
          ) : (
            <div className="h-[30px] w-[30px] animate-pulse bg-white"></div>
          )}
          {title ? (
            <span className="font-semibold">{title}</span>
          ) : (
            <span className="h-[12px] w-[100px] animate-pulse bg-white"></span>
          )}
        </a>
      </Link>
      <ConnectWallet />
    </nav>
  )
}

export default Navbar
