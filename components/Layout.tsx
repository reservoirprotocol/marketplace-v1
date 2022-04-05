import Head from 'next/head'
import { ComponentProps, FC } from 'react'
import { Toaster } from 'react-hot-toast'
import InfoBanner from './InfoBanner'
import Navbar from './Navbar'
import NetworkWarning from './NetworkWarning'

const META_TITLE = process.env.NEXT_PUBLIC_META_TITLE
const META_DESCRIPTION = process.env.NEXT_PUBLIC_META_DESCRIPTION
const OG_IMAGE = process.env.NEXT_PUBLIC_META_OG_IMAGE
const FAVICON = process.env.NEXT_PUBLIC_FAVICON

type Props = {
  navbar: ComponentProps<typeof Navbar>
}

const Layout: FC<Props> = ({ children, navbar }) => {
  const title = META_TITLE ? (
    <title>{META_TITLE}</title>
  ) : (
    <title>
      Reservoir Market | Open source NFT marketplace powered by Reservoir
      Protocol
    </title>
  )
  const description = META_DESCRIPTION ? (
    <meta name="description" content={META_DESCRIPTION} />
  ) : (
    <meta
      name="description"
      content="Reservoir Market is an open source NFT marketplace powered by Reservoir"
    />
  )
  const image = OG_IMAGE ? (
    <>
      <meta name="twitter:image" content={OG_IMAGE} />
      <meta name="og:image" content={OG_IMAGE} />
    </>
  ) : (
    <>
      <meta
        name="twitter:image"
        content="https://www.reservoir.market/og.png"
      />
      <meta property="og:image" content="https://www.reservoir.market/og.png" />
    </>
  )
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
        {/* Must  */}
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="Reservoir" />
        <meta name="keywords" content="nft, ethereum, protocol" />
        <meta name="keywords" content="NFT, API, Protocol" />
        {/* Twitter */}
        {/* The optimal size is 1200 x 630 (1.91:1 ratio). */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:site:domain"
          content="https://www.reservoir.market/"
        />
        <meta name="twitter:url" content="https://www.reservoir.market/" />
        {/* should be between 30-60 characters, with a maximum of 70 */}
        <meta
          name="twitter:title"
          content="Reservoir Market | Open source NFT marketplace powered by Reservoir Protocol"
        />
        {/* should be between 55 and 200 characters long */}
        <meta
          name="twitter:description"
          content="Reservoir Market is an open source NFT marketplace powered by Reservoir"
        />
        <meta name="twitter:site" content="@reservoir0x" />

        {/* OG - https://ogp.me/ */}
        {/* https://www.opengraph.xyz/ */}
        {/* should be between 30-60 characters, with a maximum of 90 */}
        <meta
          name="og:title"
          content="Reservoir Market | Open source NFT marketplace powered by Reservoir Protocol"
        />
        <meta property="og:type" content="website" />
        <meta property="og:determiner" content="the" />
        <meta property="og:locale" content="en" />
        {/* Make sure the important part of your description is within the first 110 characters, so it doesn't get cut off on mobile. */}
        <meta
          property="og:description"
          content="Reservoir Market is an open source NFT marketplace powered by Reservoir"
        />
        <meta property="og:site_name" content="Reservoir Market" />
        <meta property="og:url" content="https://www.reservoir.market/" />
        {/* The optimal size is 1200 x 630 (1.91:1 ratio). */}

        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1280" />
        <meta property="og:image:height" content="640" />
        <meta property="og:image:alt" content="Reservoir Market banner" />
      </Head>
      <main className="mx-auto grid max-w-screen-2xl grid-cols-4 gap-4 px-3 pb-4 md:grid-cols-8 md:px-4 lg:grid-cols-12 lg:px-6">
        <Navbar {...navbar} />
        {children}
      </main>
    </>
  )
}

export default Layout
