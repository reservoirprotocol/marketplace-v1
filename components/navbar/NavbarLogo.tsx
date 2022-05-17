import Link from 'next/link'
import { FC } from 'react'

const NAVBAR_LOGO = process.env.NEXT_PUBLIC_DESKTOP_NAVBAR_LOGO
const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID
const SOURCE_ID = process.env.NEXT_PUBLIC_SOURCE_ID
const DESKTOP_NAVBAR_LOGO = process.env.NEXT_PUBLIC_DESKTOP_NAVBAR_LOGO

type Props = {
  variant?: 'desktop' | 'mobile' | undefined
}

const NavbarLogo: FC<Props> = ({ variant }) => {
  const logo = NAVBAR_LOGO || '/reservoir.svg'
  const desktopLogo = DESKTOP_NAVBAR_LOGO || '/reservoir-desktop.svg'
  const logoAlt = SOURCE_ID ? `${SOURCE_ID} Logo` : 'Reservoir Logo'

  const mobileVariant = variant == 'mobile'
  const desktopVariant = variant == 'desktop'

  return (
    <Link href="/">
      <a className="relative inline-flex flex-none items-center gap-1">
        <img
          src={logo}
          alt={logoAlt}
          className={`h-9 w-auto ${!variant ? 'md:hidden' : ''} ${
            desktopVariant ? 'hidden' : ''
          } ${mobileVariant ? 'block' : ''}`}
        />
        <img
          src={desktopLogo}
          alt={logoAlt}
          className={`h-9 w-auto md:block ${
            !variant ? 'hidden md:block' : ''
          } ${mobileVariant ? 'hidden' : ''} ${desktopVariant ? 'block' : ''}`}
        />
        {CHAIN_ID === '4' && (
          <div
            className={`reservoir-tiny inline rounded-[4px] bg-[#EFC45C] p-1 py-[2px]
          ${!variant ? 'md:absolute md:right-0 md:top-7' : ''} ${
              desktopVariant ? 'absolute right-0 top-7' : ''
            }
          `}
          >
            Testnet
          </div>
        )}
      </a>
    </Link>
  )
}

export default NavbarLogo
