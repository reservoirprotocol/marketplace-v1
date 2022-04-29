# Reservoir Sample Marketplace

This repo is designed to help you quickly get started building on top of [Reservoir](https://reservoirprotocol.github.io/), a web3-native order book protocol.

## Modes

The marketplace supports 3 different modes:

- Single collection (e.g. [Crypto Coven](https://cryptocoven.reservoir.market))
- Multi collection community (e.g. [BAYC](https://bayc.reservoir.market))
- All collections ([example](https://www.reservoir.market))

A demo deployment allows you to test any collection, by changing the subdomain:

- [{collection-slug}.reservoir.market](https://cryptocoven.reservoir.market) (if a collection is unsupported, ping us on Discord to get it added)
- [{community-id}.reservoir.market](https://bayc.reservoir.market) (currently works with `bayc`,`loot`,`forgottenrunes`)

## Get started

Fork this repository and follow these instructions:

### Install dependencies

With yarn:

```bash
$ yarn install
```

With NPM:

```bash
$ npm install
```

### Add environment variables

| Environment Variable           | Required | Format                                                                            | Available values                                                  | Example                                                 | Description                                                                                                                                                                                    |
| ------------------------------ | -------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NEXT_PUBLIC_RESERVOIR_API_BASE | `true`   | [URL href](https://developer.mozilla.org/en-US/docs/Web/API/URL/href)             | https://api.reservoir.tools, https://api-rinkeby.reservoir.tools/ | https://api-rinkeby.reservoir.tools/                    | The Reservoir API base URL. Available on [Mainnet](https://api.reservoir.tools/) and [Rinkeby](https://api-rinkeby.reservoir.tools/).                                                          |
| NEXT_PUBLIC_CHAIN_ID           | `true`   | `Number`                                                                          | 1, 4                                                              | 4                                                       | The Ethereum network to be used. 1 for Etherem Mainnet and 4 for Rinkeby Testnet.                                                                                                              |
| NEXT_PUBLIC_PROXY_API_BASE     | `true`   | `String`                                                                          | /api/reservoir                                                    | /api/reservoir                                          | The proxy API used to pass the Reservoir API key without exposing it to the client.                                                                                                            |
| RESERVOIR_API_KEY              | `false`  | [uuid](https://en.wikipedia.org/wiki/Universally_unique_identifier)               | `N/A`                                                             | 123e4567-e89b-12d3-a456-426614174000                    | Reservoir API key provided by the Reservoir Protocol. [Get your own API key](https://reservoirprotocol.github.io/docs/api/hosted-api#api-keys).                                                |
| NEXT_PUBLIC_ORDER_KIND         | `false`  | `String`                                                                          | 721ex, wyvern-v2.3, zeroex-v4                                     | 721ex                                                   | The order kind to the be used when listing or making offers.                                                                                                                                   |
| NEXT_PUBLIC_SOURCE_ID          | `false`  | `String`                                                                          | `N/A`                                                             | Reservoir Market                                        | The source ID for the marketplace.                                                                                                                                                             |
| NEXT_PUBLIC_COLLECTION         | `false`  | `String` (Ethereum contract address)                                              | `N/A`                                                             | 0xff9c1b15b16263c61d017ee9f65c50e4ae0113d7              | Used to limit the sample marketplace to only show data about one collection.                                                                                                                   |
| NEXT_PUBLIC_COMMUNITY          | `false`  | `String`                                                                          | loot, bayc, forgottenrunes, artblocks, feltzine                   | bayc                                                    | Used to limit the sample marketplace to only show data about one community.                                                                                                                    |
| NEXT_PUBLIC_NAVBAR_TITLE       | `false`  | `String`                                                                          | `N/A`                                                             | Loot Marketplace                                        | The titled shown on the left side of the top navigation bar.                                                                                                                                   |
| NEXT_PUBLIC_NAVBAR_LOGO        | `false`  | `String` OR [URL href](https://developer.mozilla.org/en-US/docs/Web/API/URL/href) | `N/A`                                                             | /logo.png                                               | The logo shown on the left side of the top navigation bar. It can be a relative path or an URL href.                                                                                           |
| NEXT_PUBLIC_OPENSEA_API_KEY    | `false`  | `String`                                                                          | `N/A`                                                             | 1a6c419a275c34de9d83df3dbe7ab890                        | OpenSea API key used to cross post orders to OpenSea.                                                                                                                                          |
| NEXT_PUBLIC_PRIMARY_COLOR      | `false`  | `String`                                                                          | red, orange, lime, green, blue, default                           | red                                                     | Primary color use for buttons and other interactive elements.                                                                                                                                  |
| NEXT_PUBLIC_FONT_FAMILY        | `false`  | `String`                                                                          | Inter, Montserrat, Open Sans, Playfair Display, Roboto            | Roboto                                                  | Primary sans font used in the Sample Marketplace.                                                                                                                                              |
| NEXT_PUBLIC_EXTERNAL_LINKS     | `false`  | `DISPLAY_TEXT::URL_HREF,...`                                                      | `N/A`                                                             | `Blog::https://blog.com,Docs::https://docs.com`         | External links to be displayed in the top navigation bard.                                                                                                                                     |
| NEXT_PUBLIC_FAVICON            | `false`  | `String`                                                                          | `N/A`                                                             | /favicon.io                                             | A [favicon](https://developer.mozilla.org/en-US/docs/Glossary/Favicon).                                                                                                                        |
| NEXT_PUBLIC_META_TITLE         | `false`  | `String`                                                                          | `N/A`                                                             | Foo Marketplace                                         | The text used in the [<title> tag](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/title).                                                                                           |
| NEXT_PUBLIC_META_DESCRIPTION   | `false`  | `String`                                                                          | `N/A`                                                             | Trade all Foo NFTs on the one and only Foo Marketplace! | The text used in the meta description <br/>`<meta name="description" content={NEXT_PUBLIC_META_DESCRIPTION} />`                                                                                |
| NEXT_PUBLIC_META_OG_IMAGE      | `false`  | [URL href](https://developer.mozilla.org/en-US/docs/Web/API/URL/href)             | `N/A`                                                             | `https://example.com/og.png`                            | The image used in the meta og images <br/>`<meta name="twitter:image" content={NEXT_PUBLIC_META_OG_IMAGE}/>`, <br/>`<meta property="og:image" content="https://www.reservoir.market/og.png"/>` |
| NEXT_PUBLIC_BANNER_IMAGE       | `false`  | `String` OR [URL href](https://developer.mozilla.org/en-US/docs/Web/API/URL/href) | `N/A`                                                             | /banner.png                                             | The banner image used in the collection main page.                                                                                                                                             |
| NEXT_PUBLIC_TAGLINE            | `false`  | `String`                                                                          | `N/A`                                                             | This is our unique tagline!                             | A tagline to be displayed in the homepage. [Only avaiable if `NEXT_PUBLIC_COLLECTION` and `NEXT_PUBLIC_COMMUNITY` are unset]                                                                   |
| NEXT_PUBLIC_DARK_MODE          | `false`  | `String`                                                                          | `N/A`                                                             | true                                                    | If set, the sample marketplace will use a dark mode                                                                                                                                            |
| NEXT_PUBLIC_FEE_BPS            | `false`  | `String`                                                                          | `N/A`                                                             | 300                                                     | BPS is the percentage (in basis points - eg. 100 = 1%, 1000 = 10% and 10000 = 100%) of the price that will be charged as fee.                                                                  |
| NEXT_PUBLIC_FEE_RECIPIENT      | `false`  | `String` (Ethereum contract address)                                              | `N/A`                                                             | 0xff9c1b15b16263c61d017ee9f65c50e4ae0113d7              | The address that will receive BPS fee on each sale                                                                                                                                             |

You can copy the values you want to use from `env.development` or `env.production` into a new file called `.env.local`

### Run the app

Once you have your setup ready, run:

With yarn:

```bash
$ yarn dev
```

With npm:

```bash
$ npm run dev
```

### Deploy

This is a Next.js app that can be easily deployed using [Vercel](https://vercel.com/)
