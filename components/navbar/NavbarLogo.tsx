import { FC } from 'react'

const NAVBAR_LOGO = process.env.NEXT_PUBLIC_NAVBAR_LOGO
const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID
const SOURCE_ID = process.env.NEXT_PUBLIC_SOURCE_ID
const SOURCE_NAME = process.env.NEXT_PUBLIC_SOURCE_NAME
const DESKTOP_NAVBAR_LOGO = process.env.NEXT_PUBLIC_DESKTOP_NAVBAR_LOGO
const NAVBAR_LOGO_LINK = process.env.NEXT_PUBLIC_NAVBAR_LOGO_LINK
const DISABLE_NAVBAR_POWERED_BY = process.env.NEXT_PUBLIC_DISABLE_NAVBAR_POWERED_BY
const SITE = process.env.NEXT_PUBLIC_SOURCE_DOMAIN || 'reservoir.tools'

type Props = {
  variant?: 'desktop' | 'mobile' | undefined
  className?: string
}

const POWERED_BY_LOGO_SRC = {
  reservoir: {
    logoSrc: '/reservoir_watermark_light.svg',
    path: 'https://reservoir.tools'
  },
  mintplex: {
    logoSrc: '/mintplex.svg',
    path: 'https://mintplex.xyz'
  }
}

const NavbarLogo: FC<Props> = ({ variant, className }) => {
  const logo = NAVBAR_LOGO || '/reservoir.svg'
  const desktopLogo = DESKTOP_NAVBAR_LOGO || '/reservoir-desktop.svg'
  let logoAlt = 'Logo'

  if (SOURCE_NAME) {
    logoAlt = SOURCE_NAME
  } else if (SOURCE_ID) {
    logoAlt = SOURCE_ID
  }

  const mobileVariant = variant == 'mobile'
  const desktopVariant = variant == 'desktop'
  const isTestNet = CHAIN_ID === '4'

  return (
    <div className='relative flex flex-col'>
      <a
        href={NAVBAR_LOGO_LINK || '/'}
        className={`relative inline-flex flex-none items-center gap-1 w-max ${className}`}
      >
        <img
          src={logo}
          alt={logoAlt}
          className={`h-9 w-auto ${!variant ? 'md:hidden' : ''} ${desktopVariant ? 'hidden' : ''
            } ${mobileVariant ? 'block' : ''}`}
        />
        <img
          src={desktopLogo}
          alt={logoAlt}
          className={`h-9 w-auto md:block ${!variant ? 'hidden md:block' : ''
            } ${mobileVariant ? 'hidden' : ''} ${desktopVariant ? 'block' : ''}`}
        />
        {isTestNet && (
          <div
            className={`reservoir-tiny inline rounded-[4px] bg-[#EFC45C] p-1 py-[2px]
          ${!variant || desktopVariant
                ? 'md:absolute md:left-[-50px] md:bottom-[8px]'
                : ''
              }
          `}
          >
            Testnet
          </div>
        )}
      </a>
      {DISABLE_NAVBAR_POWERED_BY !== 'true' &&
        <div className='flex space-x-2 items-center w-fit mt-2'>
          <a
            target='_blank'
            rel='nofollow noreferrer'
            href={POWERED_BY_LOGO_SRC.reservoir.path + `?ref=${SITE}`}
            className='cursor-pointer'>
            <img
              src={POWERED_BY_LOGO_SRC.reservoir.logoSrc}
              className={`h-4 w-auto`}
            />
          </a>

          <p className='text-xs text-gray-100 font-semibold'>x</p>
          <a
            target='_blank'
            rel='nofollow noreferrer'
            href={POWERED_BY_LOGO_SRC.mintplex.path + `?ref=${SITE}`}
            className='cursor-pointer'>
            <img
              src={POWERED_BY_LOGO_SRC.mintplex.logoSrc}
              className={`h-4 w-auto`}
            />
          </a>
        </div>
      }
    </div>
  )
}

export default NavbarLogo
