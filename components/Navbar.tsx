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
const EXTERNAL_LINKS = process.env.NEXT_PUBLIC_EXTERNAL_LINKS || null

const Navbar: FC<Props> = ({ communityId }) => {
  const router = useRouter()

  const logo = envLogo || '/reservoir.svg'
  const logoAlt = `${title} Logo` || 'Reservoir Logo'

  const externalLinks: { name: string; url: string }[] = []

  if (typeof EXTERNAL_LINKS === 'string') {
    const linksArray = EXTERNAL_LINKS.split(',')

    linksArray.forEach((link) => {
      let values = link.split('::')
      externalLinks.push({
        name: values[0],
        url: values[1],
      })
    })
  }

  const hasExternalLinks = externalLinks.length > 0

  return (
    <nav className="col-span-full grid grid-cols-4 gap-2 py-3 sm:py-4 md:grid-cols-8 lg:grid-cols-12">
      <Link href="/">
        <a className="col-span-2 mr-auto inline-flex items-center justify-between gap-3">
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
          <div
            className={`hidden lg:block ${
              hasExternalLinks
                ? 'lg:col-span-3 lg:col-start-4'
                : 'lg:col-span-4 lg:col-start-5'
            }`}
          >
            <SearchCollections communityId={communityId} />
          </div>
        )}
      {hasExternalLinks && (
        <div className="col-start-3 ml-5 hidden items-center gap-3 md:flex lg:col-span-3 lg:col-start-7">
          {externalLinks.map(({ name, url }) => (
            <a key={url} href={url} rel="noopener noferrer">
              {name}
            </a>
          ))}
        </div>
      )}
      <ConnectWallet />
    </nav>
  )
}

export default Navbar
