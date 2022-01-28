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
          {image && <img src={image} alt={title} className="w-[30px]" />}
          {title && <span className="font-semibold">{title}</span>}
        </a>
      </Link>
      <div className="flex items-center gap-6">
        <div className="hidden sm:grid">
          <span className="text-sm opacity-75">powered by</span>
          <div className="flex items-center gap-1.5">
            <img
              src="/reservoir.svg"
              alt="Reservoir Logo"
              className="h-5 w-5"
            />
            <span className="font-['Obvia'] text-lg">reservoir</span>
          </div>
        </div>
        <ConnectWallet />
      </div>
    </nav>
  )
}

export default Navbar
