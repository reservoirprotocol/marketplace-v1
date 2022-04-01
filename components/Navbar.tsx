import { FC } from 'react'
import ConnectWallet from './ConnectWallet'
import Link from 'next/link'
import SearchCollections from './SearchCollections'
import { useRouter } from 'next/router'

type Props = {
  communityId?: string
  mode: 'global' | 'community' | 'collection'
}

const title = process.env.NEXT_PUBLIC_NAVBAR_TITLE
const envLogo = process.env.NEXT_PUBLIC_NAVBAR_LOGO
const EXTERNAL_LINKS = process.env.NEXT_PUBLIC_EXTERNAL_LINKS || null

const Navbar: FC<Props> = ({ communityId, mode }) => {
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

  const rule1 = mode === 'global' && router.pathname !== '/'

  const rule2 = mode === 'community'

  const displaySearch = rule1 || rule2

  return (
    <nav className="col-span-full flex gap-2 py-3 sm:py-4">
      <Link href="/">
        <a className="mr-4 inline-flex items-center gap-3">
          <img src={logo} alt={logoAlt} className="w-6 sm:block" />
          {title ? (
            <span className="font-semibold">{title}</span>
          ) : (
            <span className="font-['Obvia'] text-lg">reservoir.market</span>
          )}
        </a>
      </Link>
      <div className="hidden items-center md:inline-flex">
        {displaySearch && (
          <div className="hidden h-full w-[350px] flex-none lg:block">
            <SearchCollections communityId={communityId} />
          </div>
        )}
        {hasExternalLinks && (
          <div className="ml-5 hidden items-center gap-6 md:flex">
            {externalLinks.map(({ name, url }) => (
              <a
                key={url}
                href={url}
                rel="noopener noferrer"
                className="reservoir-label-l text-[#4B5563] hover:text-[#1F2937]"
              >
                {name}
              </a>
            ))}
          </div>
        )}
      </div>
      <ConnectWallet />
    </nav>
  )
}

export default Navbar
