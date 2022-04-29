import Head from 'next/head'
import { ComponentProps, FC } from 'react'
import { Toaster } from 'react-hot-toast'
import InfoBanner from './InfoBanner'
import Navbar from './Navbar'
import NetworkWarning from './NetworkWarning'

const metaTitle = process.env.NEXT_PUBLIC_META_TITLE
const metaDescription = process.env.NEXT_PUBLIC_META_DESCRIPTION
const metaImage = process.env.NEXT_PUBLIC_META_OG_IMAGE
const NAVBAR_LOGO = process.env.NEXT_PUBLIC_NAVBAR_LOGO
const FAVICON = process.env.NEXT_PUBLIC_FAVICON

type Props = {
  navbar: ComponentProps<typeof Navbar>
}

const Layout: FC<Props> = ({ children, navbar }) => {
  const title = metaTitle ? <title>{metaTitle}</title> : null
  const description = metaDescription ? (
    <meta name="description" content={metaDescription} />
  ) : null
  const image = metaImage ? (
    <>
      <meta name="twitter:image" content={metaImage} />
      <meta name="og:image" content={metaImage} />
    </>
  ) : null
  const favicon = FAVICON ? (
    <link rel="shortcut icon" type="image/svg" href={FAVICON} />
  ) : (
    <link rel="shortcut icon" type="image/svg" href="/reservoir.svg" />
  )

  return (
    <>
      <Toaster position={'top-right'} />
      <NetworkWarning />
      <InfoBanner />
      <Head>
        {title}
        {description}
        {image}
        {favicon}
      </Head>
      <main className="mx-auto grid max-w-[2560px] grid-cols-4 gap-x-4 pb-4 md:grid-cols-8 lg:grid-cols-12 3xl:grid-cols-16 4xl:grid-cols-21">
        <Navbar {...navbar} />
        {children}
      </main>
    </>
  )
}

export default Layout
