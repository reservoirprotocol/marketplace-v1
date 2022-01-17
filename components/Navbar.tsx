import { FC } from 'react'
import ConnectWallet from './ConnectWallet'
import Link from 'next/link'

const Navbar: FC = () => {
  return (
    <nav className="flex justify-between items-center">
      <Link href="/">
        <a>Market</a>
      </Link>
      <ConnectWallet />
    </nav>
  )
}

export default Navbar
