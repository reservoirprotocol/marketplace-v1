<h3 align="center">Reservoir Market v1 - [⛔️ DEPRECATED]</h3>
  <p align="center">
An open source NFT marketplace built on Reservoir.

Learn more about [v2 of the Reservoir Market](https://github.com/reservoirprotocol/marketplace-v2).

[![No Maintenance Intended](http://unmaintained.tech/badge.svg)](http://unmaintained.tech/)

<!-- ABOUT THE PROJECT -->
## About The Project


Reservoir Market is an open source marketplace that enables communities to easily launch their own NFT marketplace, accessing instant liquidity aggregated from other major marketplaces.

The marketplace supports 3 different modes:

-  Single collection (e.g.  [Crypto Coven](https://cryptocoven.reservoir.market/))
-  Multi collection community (e.g.  [BAYC](https://bayc.reservoir.market/))
-  All collections ([example](https://www.reservoir.market/))
  
With each deployment, communities are given full control over their marketplace from designing their look and feel to setting their own marketplace fees.

<p align="right">(<a href="#top">back to top</a>)</p>



<!-- GETTING STARTED -->
## Getting Started (Self-Hosted)

### Prerequisites
1. Install [Node.js and NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
2. Install [Yarn](https://classic.yarnpkg.com/en/docs/install)
3. Request free [Reservoir API key](https://api.reservoir.tools/#/0.%20Auth/postApikeys)

### Built With

* [ReservoirKit](https://docs.reservoir.tools/docs/reservoir-kit)
* [Reservoir Protocol and API](https://reservoirprotocol.github.io/)
* [Next.js](https://nextjs.org/)
* [React.js](https://reactjs.org/)
* [Ethers.io](https://ethers.io/)
* [WAGMI](https://wagmi.sh/)
* [Tailwind CSS](https://tailwindcss.com/)

### Installation

Fork this repo and follow these instructions to install dependancies.

With yarn:

```bash
$ yarn install
```

With NPM:

```bash
$ npm install
```

### Configuration
Reservoir Market is built to be fully configurable using environment variables. To preview your configuration locally you can copy the values you want to use from  `env.development`  or  `env.production`  into a new file called  `.env.local`.

Note: Environment variables can also be added during deployment via deployment platforms like [vercel](https://vercel.com/).

**Required Configuration**
| Environment Variable           | Required | Description                                                                         | Example              |
|--------------------------------|----------|-------------------------------------------------------------------------------------|---------------------|
| NEXT_PUBLIC_RESERVOIR_API_BASE | `true`   | The Reservoir API base URL. Available on Mainnet, Rinkeby, Goerli, and Optimism.                       | https://api-rinkeby.reservoir.tools/ https://api.reservoir.tools/ |
| NEXT_PUBLIC_CHAIN_ID           | `true`   | The Ethereum network to be used. 1 for Etherem Mainnet and 4 for Rinkeby Testnet, etc.   | 1 4                                                               |
| NEXT_PUBLIC_PROXY_API_BASE     | `true`   | The proxy API used to pass the Reservoir API key without exposing it to the client. | /api/reservoir                                                    |
| NEXT_PUBLIC_RESERVOIR_API_KEY              | `true`   | Reservoir API key provided by the Reservoir Protocol. [Get your own API key](https://api.reservoir.tools/#/0.%20Auth/postApikeys).         | 123e4567-e89b-12d3-a456-426614174000                              |
| NEXT_PUBLIC_ALCHEMY_ID              | `true`   | Alchemy API key required for buying items on mobile. [Get your own API key here](https://docs.alchemy.com/alchemy/introduction/getting-started#1.create-an-alchemy-key).         | 123e4567-e89b-12d3-a456-426614174000   

**General Configuration**
| Environment Variable                | Required | Description                                                                                                                                          | Example                                                                                                                                                                                   |
| :---------------------------------- | :------- | :--------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NEXT_PUBLIC_SOURCE_ID               | `false`   | **DEPRECATED**: The source ID used to attribute listings and offers from your marketplace.                                                           | Reservoir Market                                                                                                                                                                          |
| NEXT_PUBLIC_SOURCE_DOMAIN           | `false`   | The source ID used to attribute listings and offers from your marketplace. Must be in a domain format.                                               | reservoir.market                                                                                                                                                                          |
| NEXT_PUBLIC_SOURCE_NAME             | `false`  | The source name used to attribute listings and offers from your marketplace, falls back to the domain.                                               | Reservoir Market                                                                                                                                                                          |
| NEXT_PUBLIC_ORDER_KIND              | `false`  | The order kind to be used when listing or making offers on your marketplace. Default will use `seaport` if not set.                                  | zeroex-v4. wyvern-v2.3, seaport                                                                                                                                                           |
| NEXT_PUBLIC_FEE_BPS                 | `false`  | The marketplace fee that will be earned from native listings and offers on your marketplace. Configured as <<glossary:bps>>.                         | 100                                                                                                                                                                                       |
| NEXT_PUBLIC_FEE_RECIPIENT           | `false`  | The address that will receive marketplace fee.                                                                                                       | 0xF296178d553C8Ec21A2fBD2c5dDa8CA9ac905A00                                                                                                                                                |
| NEXT_PUBLIC_COLLECTION              | `false`  | Use this to configure a single collection marketplace or set the default collection for your community marketplace.                                  | 0x8d04a8c79ceb0889bdd12acdf3fa9d207ed3ff63                                                                                                                                                |
| NEXT_PUBLIC_COLLECTION_SET_ID       | `false`  | Use this to configure a community marketplace. [Generate your collection set ID here](https://docs.reservoir.tools/reference/postcollectionssetsv1). | f566ba09c14f56aedeed3f77e3ae7f5ff28b9177714d3827a87b7a182f8f90ff                                                                                                                          |
| NEXT_PUBLIC_COMMUNITY               | `false`  | Use this to configure a community marketplace. Note: Community IDs are only available for certain communities.                                       | artblocks                                                                                                                                                                                 |
| NEXT_PUBLIC_REDIRECT_HOMEPAGE       | `false`  | If enabled, homepage will automatically redirect to collection page set in NEXT_PUBLIC_COLLECTION.                                                   | true                                                                                                                                                                                      |
| NEXT_PUBLIC_EXTERNAL_LINKS          | `false`  | External links to be displayed in the top navigation bar.                                                                                            | Blog::[\<\<\<\<https://blog.com,Docs::https://docs.com>>>>](https://blog.com,Docs::https://docs.com)                                                                                      |
| NEXT_PUBLIC_COLLECTION_DESCRIPTIONS | `false`  | Customize descriptions on a per collection basis.                                                                                                    | 0xb74bf94049d2c01f8805b8b15db0909168cabf46::`test description`,0xc751c84678d8e229e361f9b04c080256516f4a0a::`another description`                                                          |
| NEXT_PUBLIC_NAVBAR_LOGO_LINK        | `false`  | Customize the marketplace navbar logo's link.                                                                                                        | <https://blog.com>                                                                                                                                                                        |
| NEXT_PUBLIC_DEFAULT_TO_SEARCH       | `false`  | If enabled, search bar will be displayed instead of collection switcher.                                                                             | true                                                                                                                                                                                      |
| NEXT_PUBLIC_LISTING_CURRENCIES      | `false`  | Customize which currency users can list in.                                                                                                          | [{"symbol": "ETH", "decimals": 18, "contract": "0x0000000000000000000000000000000000000000"},{"symbol": "USDC", "decimals": 6, "contract": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"}] |

**Design Configuration**

| Environment Variable                     | Required | Description                                                                                                                                                   | Example                                                                                                                                                                                            |
| :--------------------------------------- | :------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NEXT_PUBLIC_NAVBAR_LOGO                  | `false`  | The logo of your marketplace that appears on mobile.                                                                                                          | <https://www.reservoir.market/reservoir.svg>                                                                                                                                                       |
| NEXT_PUBLIC_DESKTOP_NAVBAR_LOGO          | `false`  | The logo of your marketplace that appears on desktop.                                                                                                         | <https://www.reservoir.market/reservoir-desktop.svg>                                                                                                                                               |
| NEXT_PUBLIC_FAVICON                      | `false`  | The favicon for your marketplace.                                                                                                                             | <https://www.reservoir.market/reservoir.svg>                                                                                                                                                       |
| NEXT_PUBLIC_SOURCE_ICON                  | `false`  | The icon that appears on native listings.                                                                                                                     | <https://www.reservoir.market/reservoir.svg>                                                                                                                                                       |
| NEXT_PUBLIC_DISABLE_POWERED_BY_RESERVOIR | `false`  | Use this to disable the Powered by Reservoir tag on modals.                                                                                                   | true                                                                                                                                                                                               |
| NEXT_PUBLIC_DARK_MODE                    | `false`  | Use this to enable dark mode theme.                                                                                                                           | true                                                                                                                                                                                               |
| NEXT_PUBLIC_THEME_SWITCHING_ENABLED      | `false`  | Use this to allow users to toggle between the dark and light theme. If NEXT_PUBLIC_DARK_MODE is enabled then that will be the default theme selected.         | true                                                                                                                                                                                               |
| NEXT_PUBLIC_PRIMARY_COLOR                | `false`  | Use this to select your primary color.                                                                                                                        | default, red, orange, lime, green, blue                                                                                                                                                            |
| NEXT_PUBLIC_FONT_FAMILY                  | `false`  | Primary sans font used in your marketplace.                                                                                                                   | Inter, Montserrat, Open Sans, Playfair Display, Roboto, Druk, Nunito Sans, Lucida Grande, Gazpacho, Frank Ruh Libre, Chalkboard, Gothicus Roman, Styrene B Black, Montserrat Uppercase Bold Italic |
| NEXT_PUBLIC_BODY_FONT_FAMILY             | `false`  | Secondary font family used in your marketplace.                                                                                                               | Inter, Montserrat, Open Sans, Playfair Display, Roboto, Druk, Nunito Sans, Lucida Grande, Gazpacho, Frank Ruh Libre, Chalkboard, Gothicus Roman, Styrene B Black, Montserrat Uppercase Bold Italic |
| NEXT_PUBLIC_FONT_URLS                    | `false`  | Use in conjunction with NEXT_PUBLIC_FONT_FAMILY and NEXT_PUBLIC_BODY_FONT_FAMILY to pull in a remote font, using services like google fonts, adobe fonts etc. | <https://fonts.googleapis.com/css2?family=Blaka&display=swap,https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap>                                                                     |
| NEXT_PUBLIC_BANNER_IMAGE                 | `false`  | The background banner image used on collection pages. If not set this will use the default collection banner.                                                 | <https://www.reservoir.market/banner.png>                                                                                                                                                          |
| NEXT_PUBLIC_DISABLE_COLLECTION_BG        | `false`  | Use this to hide the background banners on collection pages.                                                                                                  | true                                                                                                                                                                                               |
| NEXT_PUBLIC_TAGLINE                      | `false`  | A tagline to be displayed in the homepage. Only available if NEXT_PUBLIC_COLLECTION and NEXT_PUBLIC_COMMUNITY are unset.                                      | Buy, sell and collect NFTs!                                                                                                                                                                        |
| NEXT_PUBLIC_FOOTER_ENABLED               | `false`  | If enabled, a footer will be displayed on the homepage and the list of trending collections will be capped at 100.                                            | true                                                                                                                                                                                               |

**SEO Configuration**

| Environment Variable         | Required | Description                            | Example                                                                  |
| :--------------------------- | :------- | :------------------------------------- | :----------------------------------------------------------------------- |
| NEXT_PUBLIC_META_TITLE       | `false`  | The text used in the <title> tag.      | Reservoir Market \| Open Source NFT Marketplace                          |
| NEXT_PUBLIC_META_DESCRIPTION | `false`  | The text used in the meta description  | Reservoir Market is an open source NFT marketplace built with Reservoir. |
| NEXT_PUBLIC_META_OG_IMAGE    | `false`  | The image used in the meta og images . | <https://www.reservoir.market/og.png>                                    |

### Run the App

Once you have your setup ready, run:

With yarn:

    $ yarn dev

With npm:

    $ npm run dev

### Deploy with Vercel

This is a Next.js app that can be easily deployed using  [Vercel](https://vercel.com/). For  more information on how to deploy your Github repository with Vercel visit their [docs](https://vercel.com/docs/concepts/projects/overview).

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- Contributing -->
## Contributing

If you'd like to contribute please follow the [guidelines](https://github.com/reservoirprotocol/marketplace/blob/main/CONTRIBUTING.md).

<!-- CONTACT -->
## Contact

Twitter: [@reservoir0x](https://twitter.com/reservoir0x)
Project Link: [Reservoir](https://reservoirprotocol.github.io/)

<p align="right">(<a href="#top">back to top</a>)</p>
