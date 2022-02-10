import { ComponentProps, FC } from 'react'
import ConnectWallet from './ConnectWallet'
import Link from 'next/link'
import InfoModal from './InfoModal'
import SearchCollections from './SearchCollections'
import { useRouter } from 'next/router'

type Props = {
  isHome: boolean
  collections: ComponentProps<typeof SearchCollections>['fallback']
}

const apiBase = process.env.NEXT_PUBLIC_API_BASE
const title = process.env.NEXT_PUBLIC_NAVBAR_TITLE
const logo = process.env.NEXT_PUBLIC_NAVBAR_LOGO

const Navbar: FC<Props> = ({ isHome, collections }) => {
  const router = useRouter()
  return (
    <nav className="flex items-center justify-between py-3 px-3 sm:py-4">
      <Link href="/">
        <a className="flex items-center justify-between gap-3">
          <img
            src={logo || '/reservoir.svg'}
            alt={`${title} Logo` || 'Reservoir Logo'}
            className="hidden w-[25px] sm:block"
          />
          {title ? (
            <span className="font-semibold">{title}</span>
          ) : (
            <span className="font-['Obvia'] text-lg">reservoir.market</span>
          )}
        </a>
      </Link>
      {apiBase && router.pathname !== '/' && isHome && (
        <div className="hidden lg:block">
          <SearchCollections apiBase={apiBase} fallback={collections} />
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
