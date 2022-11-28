import { FC, ReactElement, useEffect, useState } from 'react'
import ConnectWallet from './ConnectWallet'
import HamburgerMenu from './HamburgerMenu'
import dynamic from 'next/dynamic'
import { paths } from '@reservoir0x/reservoir-kit-client'
import setParams from 'lib/params'
import NavbarLogo from 'components/navbar/NavbarLogo'
import ThemeSwitcher from './ThemeSwitcher'
import CartMenu from './CartMenu'
import SearchMenu from './SearchMenu'
import { useMediaQuery } from '@react-hookz/web'
import useMounted from 'hooks/useMounted'

const SearchCollections = dynamic(() => import('./SearchCollections'))
const CommunityDropdown = dynamic(() => import('./CommunityDropdown'))
const EXTERNAL_LINKS = process.env.NEXT_PUBLIC_EXTERNAL_LINKS || null
const COLLECTION = process.env.NEXT_PUBLIC_COLLECTION
const COMMUNITY = process.env.NEXT_PUBLIC_COMMUNITY
const COLLECTION_SET_ID = process.env.NEXT_PUBLIC_COLLECTION_SET_ID
const DEFAULT_TO_SEARCH = process.env.NEXT_PUBLIC_DEFAULT_TO_SEARCH

function getInitialSearchHref() {
  const PROXY_API_BASE = process.env.NEXT_PUBLIC_PROXY_API_BASE
  const pathname = `${PROXY_API_BASE}/search/collections/v1`
  const query: paths['/search/collections/v1']['get']['parameters']['query'] =
    {}

  if (COLLECTION_SET_ID) {
    query.collectionsSetId = COLLECTION_SET_ID
  } else {
    if (COMMUNITY) query.community = COMMUNITY
  }

  return setParams(pathname, query)
}

const Navbar: FC = () => {
  const isMounted = useMounted()
  const [showLinks, setShowLinks] = useState(true)
  const [filterComponent, setFilterComponent] = useState<ReactElement | null>(
    null
  )
  const isMobile = useMediaQuery('(max-width: 770px)')
  const showDesktopSearch = useMediaQuery('(min-width: 1200px)')
  const [hasCommunityDropdown, setHasCommunityDropdown] =
    useState<boolean>(false)

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

  const isGlobal = !COMMUNITY && !COLLECTION && !COLLECTION_SET_ID
  const filterableCollection = isGlobal || COMMUNITY || COLLECTION_SET_ID

  useEffect(() => {
    setShowLinks(externalLinks.length > 0)
  }, [])

  useEffect(() => {
    if (filterableCollection) {
      const href = getInitialSearchHref()

      fetch(href).then(async (res) => {
        let initialResults = undefined

        if (res.ok) {
          initialResults =
            (await res.json()) as paths['/search/collections/v1']['get']['responses']['200']['schema']
        }

        const smallCommunity =
          initialResults?.collections &&
          initialResults.collections.length >= 2 &&
          initialResults.collections.length <= 10

        const hasCommunityDropdown =
          !DEFAULT_TO_SEARCH &&
          (COMMUNITY || COLLECTION_SET_ID) &&
          smallCommunity

        if (hasCommunityDropdown) {
          setFilterComponent(
            <CommunityDropdown
              collections={initialResults?.collections}
              defaultCollectionId={COLLECTION}
            />
          )
          setHasCommunityDropdown(true)
        } else {
          setHasCommunityDropdown(false)
          !showDesktopSearch
            ? setFilterComponent(
                <SearchMenu
                  communityId={COMMUNITY}
                  initialResults={initialResults}
                />
              )
            : setFilterComponent(
                <SearchCollections
                  communityId={COMMUNITY}
                  initialResults={initialResults}
                />
              )
        }
      })
    }
  }, [filterableCollection, showDesktopSearch])

  if (!isMounted) {
    return null
  }

  return (
    <nav className="sticky top-0 z-[1000] col-span-full flex items-center justify-between gap-2 border-b border-[#D4D4D4] bg-white px-6 py-4 dark:border-neutral-600 dark:bg-black md:gap-3 md:py-6 md:px-16">
      <NavbarLogo className="z-10 max-w-[300px]" />
      {showLinks && (
        <div className="z-10 ml-12 mr-12 hidden items-center gap-11 md:flex">
          {externalLinks.map(({ name, url }) => (
            <a
              key={url}
              href={url}
              className="text-dark reservoir-h6 hover:text-[#1F2937] dark:text-white"
            >
              {name}
            </a>
          ))}
        </div>
      )}
      {(hasCommunityDropdown || showDesktopSearch) && (
        <div className="flex h-full w-full items-center">
          {filterComponent && filterComponent}
        </div>
      )}
      {isMobile ? (
        <div className="ml-auto flex gap-x-5">
          {!hasCommunityDropdown && filterComponent && filterComponent}
          <CartMenu />
          <HamburgerMenu externalLinks={externalLinks} />
        </div>
      ) : (
        <div className="z-10 ml-auto shrink-0 gap-2 md:flex xl:gap-4">
          {!hasCommunityDropdown && !showDesktopSearch && (
            <div className="ml-auto flex">
              {filterComponent && filterComponent}
            </div>
          )}
          <CartMenu />
          <ConnectWallet />
          <ThemeSwitcher />
        </div>
      )}
    </nav>
  )
}

export default Navbar
