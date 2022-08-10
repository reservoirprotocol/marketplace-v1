import { findChain } from 'hooks/useEnvChain'
import Document, {
  Html,
  Head,
  Main,
  NextScript,
  DocumentContext,
} from 'next/document'

const DARK_MODE = process.env.NEXT_PUBLIC_DARK_MODE
const META_TITLE = process.env.NEXT_PUBLIC_META_TITLE
const META_DESCRIPTION = process.env.NEXT_PUBLIC_META_DESCRIPTION
const OG_IMAGE = process.env.NEXT_PUBLIC_META_OG_IMAGE
const META_URL = process.env.NEXT_PUBLIC_META_URL
const FAVICON = process.env.NEXT_PUBLIC_FAVICON
const SOURCE_ID = process.env.NEXT_PUBLIC_SOURCE_ID
const META_TWITTER_USERNAME = process.env.NEXT_PUBLIC_META_TWITTER_USERNAME
const FONT_URLS = process.env.NEXT_PUBLIC_FONT_URLS
const SOURCE_ICON = process.env.NEXT_PUBLIC_SOURCE_ICON
const SOURCE_NAME = process.env.NEXT_PUBLIC_SOURCE_NAME
const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID

const MyDocument = function () {
  const chain = findChain(CHAIN_ID)

  return (
    <Html className={DARK_MODE ? 'dark' : ''}>
      <Head />
      {/* Must  */}
      <meta charSet="utf-8" />
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="keywords" content="nft, ethereum, protocol" />
      <link rel="shortcut icon" type="image/svg" href={FAVICON} />
      <title>{META_TITLE}</title>
      <meta name="description" content={META_DESCRIPTION} />
      <meta name="keywords" content="NFT, API, Protocol" />
      {/* Twitter */}
      {/* The optimal size is 1200 x 630 (1.91:1 ratio). */}
      <meta name="twitter:image" content={OG_IMAGE} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site:domain" content={META_URL} />
      <meta name="twitter:url" content={META_URL} />
      {/* should be between 30-60 characters, with a maximum of 70 */}
      <meta name="twitter:title" content={META_TITLE} />
      {/* should be between 55 and 200 characters long */}
      <meta name="twitter:description" content={META_DESCRIPTION} />
      <meta name="twitter:site" content={META_TWITTER_USERNAME} />

      {/* OG - https://ogp.me/ */}
      {/* https://www.opengraph.xyz/ */}
      {/* should be between 30-60 characters, with a maximum of 90 */}
      <meta name="og:title" content={META_TITLE} />
      <meta property="og:type" content="website" />
      <meta property="og:determiner" content="the" />
      <meta property="og:locale" content="en" />
      {/* Make sure the important part of your description is within the first 110 characters, so it doesn't get cut off on mobile. */}
      <meta property="og:description" content={META_DESCRIPTION} />
      <meta property="og:site_name" content={SOURCE_ID} />
      <meta property="og:url" content={META_URL} />
      {/* The optimal size is 1200 x 630 (1.91:1 ratio). */}
      <meta property="og:image" content={OG_IMAGE} />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:image:width" content="1280" />
      <meta property="og:image:height" content="640" />
      <meta
        property="og:image:alt"
        content={`${SOURCE_NAME || SOURCE_ID || 'Market'} banner`}
      />

      {/* Reservoir Meta Tags */}
      {SOURCE_NAME ? (
        <meta property="reservoir:title" content={SOURCE_NAME} />
      ) : null}
      {SOURCE_ICON || FAVICON ? (
        <meta property="reservoir:icon" content={SOURCE_ICON || FAVICON} />
      ) : null}

      {chain && chain.network ? (
        <meta
          property={`reservoir:token-url-${
            chain.network === 'homestead' ? 'mainnet' : chain.network
          }`}
          content="/${contract}/${tokenId}"
        />
      ) : null}

      {FONT_URLS
        ? FONT_URLS.split(',').map((link, i) => (
            <link key={i} href={link} rel="stylesheet" />
          ))
        : null}

      <body className="bg-white text-neutral-800 dark:bg-black dark:text-white">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}

MyDocument.getInitialProps = async (ctx: DocumentContext) => {
  const initialProps = await Document.getInitialProps(ctx)
  return { ...initialProps }
}

export default MyDocument
