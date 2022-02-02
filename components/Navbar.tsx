import { FC } from 'react'
import ConnectWallet from './ConnectWallet'
import Link from 'next/link'
import InfoModal from './InfoModal'
import SearchCollection from './SearchCollections'
import { useRouter } from 'next/router'

type Props = {
  title: string | undefined
  image: string | undefined
}

const apiBase = process.env.NEXT_PUBLIC_API_BASE

const Navbar: FC<Props> = ({ title, image }) => {
  const router = useRouter()
  return (
    <nav className="flex items-center justify-between py-3 px-3 sm:py-4">
      <Link href="/">
        {title ? (
          <a className="flex items-center justify-between gap-3">
            {image && (
              <img
                src={image}
                alt={title}
                className="hidden w-[30px] sm:block"
              />
            )}
            {title && <span className="font-semibold">{title}</span>}
          </a>
        ) : (
          <a className="flex items-center gap-1.5">
            <img
              src="/reservoir.svg"
              alt="Reservoir Logo"
              className="h-5 w-5"
            />
            <span className="font-['Obvia'] text-lg">reservoir.market</span>
          </a>
        )}
      </Link>
      {apiBase && router.pathname !== '/' && (
        <div className="hidden lg:block">
          <SearchCollection apiBase={apiBase} />
        </div>
      )}
      <div className="flex items-center gap-6">
        <InfoModal />
        <ConnectWallet />
      </div>
    </nav>
  )
}

export default Navbar
