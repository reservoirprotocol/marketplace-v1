import { FC } from 'react'
import ConnectWallet from './ConnectWallet'
import Link from 'next/link'
import SearchCollections from './SearchCollections'
import HamburgerMenu from './HamburgerMenu'

type Props = {
  communityId?: string
  mode: 'global' | 'community' | 'collection'
}

const NAVBAR_TITLE = process.env.NEXT_PUBLIC_NAVBAR_TITLE
const NAVBAR_LOGO = process.env.NEXT_PUBLIC_NAVBAR_LOGO
const EXTERNAL_LINKS = process.env.NEXT_PUBLIC_EXTERNAL_LINKS || null
const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID

const Navbar: FC<Props> = ({ communityId, mode }) => {
  const logo = NAVBAR_LOGO || '/reservoir.svg'
  const logoAlt = `${NAVBAR_TITLE} Logo` || 'Reservoir Logo'

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

  const rule1 = mode === 'global'

  const rule2 = mode === 'community'

  const displaySearch = rule1 || rule2

  const search = <SearchCollections communityId={communityId} />

  return (
    <nav className="col-span-full flex items-center gap-4 px-6 py-4 md:py-6 md:px-16">
      <Link href="/">
        <a className="relative mr-4 inline-flex items-center gap-1">
          <img src={logo} alt={logoAlt} className="h-8 sm:block" />
          {NAVBAR_TITLE ? (
            <div className="hidden font-semibold md:block">{NAVBAR_TITLE}</div>
          ) : (
            <div className="hidden font-['Obvia'] text-lg md:block">
              reservoir.market
            </div>
          )}
          {CHAIN_ID === '4' && (
            <div className="reservoir-tiny rounded-[4px] bg-[#EFC45C] p-1 py-[2px] md:absolute md:left-[133px] md:top-7">
              Testnet
            </div>
          )}
        </a>
      </Link>
      <div className="flex w-full gap-4 md:w-auto">
        {displaySearch && (
          <div className="h-full w-full flex-grow">{search}</div>
        )}
        {hasExternalLinks && (
          <div className="hidden items-center gap-6 md:flex">
            {externalLinks.map(({ name, url }) => (
              <a
                key={url}
                href={url}
                rel="noopener noferrer"
                className="reservoir-label-l text-[#4B5563] hover:text-[#1F2937] dark:text-neutral-300"
              >
                {name}
              </a>
            ))}
          </div>
        )}
      </div>
      <HamburgerMenu search={search} externalLinks={externalLinks} />
      <div className="ml-auto hidden md:block">
        <ConnectWallet />
      </div>
    </nav>
  )
}

export default Navbar
