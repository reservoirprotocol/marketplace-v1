import { FC } from 'react'
import ConnectWallet from './ConnectWallet'
import Link from 'next/link'

type Props = {
  title: string | undefined
  image: string | undefined
  collection?: string
}

const Navbar: FC<Props> = ({ title, image, collection }) => {
  return (
    <nav className="flex items-center justify-between">
      <Link href={collection ? `/collections/${collection}` : '/'}>
        <a className="flex items-center justify-between gap-3">
          {image && <img src={image} alt={title} className="w-[30px]" />}
          {title && <span className="font-semibold">{title}</span>}
        </a>
      </Link>
      <div className="flex items-center gap-6">
        <Link href="https://github.com/reservoirprotocol/sample-marketplace">
          <a
            className="font-medium hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Fork me on GitHub
          </a>
        </Link>
        <ConnectWallet />
      </div>
    </nav>
  )
}

export default Navbar
