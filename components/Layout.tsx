import Head from 'next/head'
import { ComponentProps, FC } from 'react'
import { Toaster } from 'react-hot-toast'
import InfoBanner from './InfoBanner'
import Navbar from './Navbar'
import NetworkWarning from './NetworkWarning'

const metaTitle = process.env.NEXT_PUBLIC_META_TITLE
const metaDescription = process.env.NEXT_PUBLIC_META_DESCRIPTION
const metaImage = process.env.NEXT_PUBLIC_META_OG_IMAGE

type Props = {
  navbar?: ComponentProps<typeof Navbar>
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

  return (
    <>
      <Toaster position={'top-right'} />
      <NetworkWarning />
      <InfoBanner />
      <Head>
        {title}
        {description}
        {image}
      </Head>
      <main className="mx-auto grid max-w-screen-2xl grid-cols-4 gap-4 px-3 pb-4 md:grid-cols-8 md:px-4 lg:grid-cols-12 lg:px-6">
        <Navbar {...navbar} />
        {children}
      </main>
    </>
  )
}

export default Layout
