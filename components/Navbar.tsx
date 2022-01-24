import { FC } from 'react'
import ConnectWallet from './ConnectWallet'
import Link from 'next/link'

type Props = {
  title: string
  image: string
}

const Navbar: FC<Props> = ({ title, image }) => {
  return (
    <nav className="flex justify-between items-center">
      <Link href="/">
        <a className="flex gap-3 justify-between items-center">
          <img src={image} alt={title} className="w-[30px]" />
          <span className="font-semibold">{title}</span>
        </a>
      </Link>
      <ConnectWallet />
    </nav>
  )
}

export default Navbar
