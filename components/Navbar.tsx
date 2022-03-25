import { FC } from 'react'
import ConnectWallet from './ConnectWallet'
import Link from 'next/link'
import SearchCollections from './SearchCollections'
import { useRouter } from 'next/router'

type Props = {
  communityId?: string
}

const title = process.env.NEXT_PUBLIC_NAVBAR_TITLE
const envLogo = process.env.NEXT_PUBLIC_NAVBAR_LOGO

const Navbar: FC<Props> = ({ communityId }) => {
  const router = useRouter()

  const logo = envLogo || '/reservoir.svg'
  const logoAlt = `${title} Logo` || 'Reservoir Logo'

  return (
    <nav className="col-span-full grid grid-cols-4 gap-2 py-3 sm:py-4 md:grid-cols-8 lg:grid-cols-12">
      <Link href="/">
        <a className="col-span-2 mr-auto inline-flex items-center justify-between gap-3 lg:col-span-4">
          <img src={logo} alt={logoAlt} className="w-6 sm:block" />
          {title ? (
            <span className="font-semibold">{title}</span>
          ) : (
            <span className="font-['Obvia'] text-lg">reservoir.market</span>
          )}
        </a>
      </Link>
      {router.pathname !== '/' &&
        router.pathname !== '/[contract]/[tokenId]' &&
        router.pathname !== '/[address]' && (
          <div className="hidden lg:col-span-4 lg:col-start-5 lg:block">
            <SearchCollections communityId={communityId} />
          </div>
        )}
      <ConnectWallet />
    </nav>
  )
}

export default Navbar
