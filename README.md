<h3 align="center">Reservoir Market</h3>

  <p align="center">
An open source NFT marketplace built on Reservoir.    <br />
    <a href="https://reservoirprotocol.github.io/docs/protocol/intro/"><strong>Explore the docs »</strong></a>
    <br />
 
<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

Reservoir Market is an open source marketplace that enables communities to easily launch their own NFT marketplace, accessing instant liquidity aggregated from other major marketplaces.

The marketplace supports 3 different modes:

-   Single collection (e.g.  [Crypto Coven](https://cryptocoven.reservoir.market/))
-   Multi collection community (e.g.  [BAYC](https://bayc.reservoir.market/))
-   All collections ([example](https://www.reservoir.market/))

With each deployment, communities are given full control over their marketplace from designing their look and feel to setting their own marketplace fees.

We currently offer hosted and self hosted deployment options. For self hosted deployments you can simply fork this repository and follow the instructions below to configure and deploy your marketplace. For hosted deployments please submit your request and we will be in touch.

Submit your request for a Hosted Deployment here.

<p align="right">(<a href="#top">back to top</a>)</p>



<!-- GETTING STARTED -->
## Getting Started (Self-Hosted)

### Prerequisites
1. Install [Node.js and NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
2. Install [Yarn](https://classic.yarnpkg.com/en/docs/install)
3. Request free [Reservoir API key](https://api.reservoir.tools/#/0.%20Auth/postApikeys)

### Built With

This section should list any major frameworks/libraries used to bootstrap your project. Leave any add-ons/plugins for the acknowledgements section. Here are a few examples.

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
Reservoir Market is built to be 100% configurable using environment variables. To preview your configuration locally you can copy the values you want to use from  `env.development`  or  `env.production`  into a new file called  `.env.local`

Note: Environment variables can also be added during deployment via deployment platforms like [vercel](https://vercel.com/).

| Environment Variable              | Required | Format                                                                            | Available values                                                                          | Example                                                 | Description                                                                                                                                                                                    |
| --------------------------------- | -------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NEXT_PUBLIC_RESERVOIR_API_BASE    | `true`   | [URL href](https://developer.mozilla.org/en-US/docs/Web/API/URL/href)             | https://api.reservoir.tools, https://api-rinkeby.reservoir.tools/                         | https://api-rinkeby.reservoir.tools/                    | The Reservoir API base URL. Available on [Mainnet](https://api.reservoir.tools/) and [Rinkeby](https://api-rinkeby.reservoir.tools/).                                                          |
| NEXT_PUBLIC_CHAIN_ID              | `true`   | `Number`                                                                          | 1, 4                                                                                      | 4                                                       | The Ethereum network to be used. 1 for Etherem Mainnet and 4 for Rinkeby Testnet.                                                                                                              |
| NEXT_PUBLIC_PROXY_API_BASE        | `true`   | `String`                                                                          | /api/reservoir                                                                            | /api/reservoir                                          | The proxy API used to pass the Reservoir API key without exposing it to the client.                                                                                                            |
| RESERVOIR_API_KEY                 | `false`  | [uuid](https://en.wikipedia.org/wiki/Universally_unique_identifier)               | `N/A`                                                                                     | 123e4567-e89b-12d3-a456-426614174000                    | Reservoir API key provided by the Reservoir Protocol. [Get your own API key](https://reservoirprotocol.github.io/docs/api/hosted-api#api-keys).                                                |
| NEXT_PUBLIC_ORDER_KIND            | `false`  | `String`                                                                          | 721ex, wyvern-v2.3, zeroex-v4                                                             | 721ex                                                   | The order kind to the be used when listing or making offers.                                                                                                                                   |
| NEXT_PUBLIC_SOURCE_ID             | `false`  | `String`                                                                          | `N/A`                                                                                     | Reservoir Market                                        | The source ID for the marketplace.                                                                                                                                                             |
| NEXT_PUBLIC_COLLECTION            | `false`  | `String` (Ethereum contract address)                                              | `N/A`                                                                                     | 0xff9c1b15b16263c61d017ee9f65c50e4ae0113d7              | Used to limit the sample marketplace to only show data about one collection.                                                                                                                   |
| NEXT_PUBLIC_COMMUNITY             | `false`  | `String`                                                                          | loot, bayc, forgottenrunes, artblocks, feltzine                                           | bayc                                                    | Used to limit the sample marketplace to only show data about one community.                                                                                                                    |
| NEXT_PUBLIC_NAVBAR_TITLE          | `false`  | `String`                                                                          | `N/A`                                                                                     | Loot Marketplace                                        | The titled shown on the left side of the top navigation bar.                                                                                                                                   |
| NEXT_PUBLIC_NAVBAR_LOGO           | `false`  | `String` OR [URL href](https://developer.mozilla.org/en-US/docs/Web/API/URL/href) | `N/A`                                                                                     | /logo.png                                               | The logo shown on the left side of the top navigation bar. It can be a relative path or an URL href.                                                                                           |
| NEXT_PUBLIC_OPENSEA_API_KEY       | `false`  | `String`                                                                          | `N/A`                                                                                     | 1a6c419a275c34de9d83df3dbe7ab890                        | OpenSea API key used to cross post orders to OpenSea.                                                                                                                                          |
| NEXT_PUBLIC_PRIMARY_COLOR         | `false`  | `String`                                                                          | red, orange, lime, green, blue, default                                                   | red                                                     | Primary color use for buttons and other interactive elements.                                                                                                                                  |
| NEXT_PUBLIC_FONT_FAMILY           | `false`  | `String`                                                                          | Inter, Montserrat, Open Sans, Playfair Display, Roboto, Druk Text Wide Web Medium Regular | Roboto                                                  | Primary sans font used in the Sample Marketplace.                                                                                                                                              |
| NEXT_PUBLIC_EXTERNAL_LINKS        | `false`  | `DISPLAY_TEXT::URL_HREF,...`                                                      | `N/A`                                                                                     | `Blog::https://blog.com,Docs::https://docs.com`         | External links to be displayed in the top navigation bard.                                                                                                                                     |
| NEXT_PUBLIC_FAVICON               | `false`  | `String`                                                                          | `N/A`                                                                                     | /favicon.io                                             | A [favicon](https://developer.mozilla.org/en-US/docs/Glossary/Favicon).                                                                                                                        |
| NEXT_PUBLIC_META_TITLE            | `false`  | `String`                                                                          | `N/A`                                                                                     | Foo Marketplace                                         | The text used in the [<title> tag](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/title).                                                                                           |
| NEXT_PUBLIC_META_DESCRIPTION      | `false`  | `String`                                                                          | `N/A`                                                                                     | Trade all Foo NFTs on the one and only Foo Marketplace! | The text used in the meta description <br/>`<meta name="description" content={NEXT_PUBLIC_META_DESCRIPTION} />`                                                                                |
| NEXT_PUBLIC_META_URL              | `false`  | `String`                                                                          | `N/A`                                                                                     | `https://example.com/`                                  | The url used on <br/>`<meta property="og:url" content="{NEXT_PUBLIC_META_URL}" />`                                                                                                             |
| NEXT_PUBLIC_META_TWITTER_USERNAME | `false`  | `String`                                                                          | `N/A`                                                                                     | @loremipsum                                             | The Twitter username used on <br/>`<meta name="twitter:site" content={NEXT_PUBLIC_META_TWITTER_USERNAME} />`                                                                                   |
| NEXT_PUBLIC_META_OG_IMAGE         | `false`  | [URL href](https://developer.mozilla.org/en-US/docs/Web/API/URL/href)             | `N/A`                                                                                     | `https://example.com/og.png`                            | The image used in the meta og images <br/>`<meta name="twitter:image" content={NEXT_PUBLIC_META_OG_IMAGE}/>`, <br/>`<meta property="og:image" content="https://www.reservoir.market/og.png"/>` |
| NEXT_PUBLIC_BANNER_IMAGE          | `false`  | `String` OR [URL href](https://developer.mozilla.org/en-US/docs/Web/API/URL/href) | `N/A`                                                                                     | /banner.png                                             | The banner image used in the collection main page.                                                                                                                                             |
| NEXT_PUBLIC_TAGLINE               | `false`  | `String`                                                                          | `N/A`                                                                                     | This is our unique tagline!                             | A tagline to be displayed in the homepage. [Only avaiable if `NEXT_PUBLIC_COLLECTION` and `NEXT_PUBLIC_COMMUNITY` are unset]                                                                   |
| NEXT_PUBLIC_DARK_MODE             | `false`  | `String`                                                                          | `N/A`                                                                                     | true                                                    | If set, the sample marketplace will use a dark mode                                                                                                                                            |
| NEXT_PUBLIC_FEE_BPS               | `false`  | `String`                                                                          | `N/A`                                                                                     | 300                                                     | BPS is the percentage (in basis points - eg. 100 = 1%, 1000 = 10% and 10000 = 100%) of the price that will be charged as fee.                                                                  |
| NEXT_PUBLIC_FEE_RECIPIENT         | `false`  | `String` (Ethereum contract address)                                              | `N/A`                                                                                     | 0xff9c1b15b16263c61d017ee9f65c50e4ae0113d7              | The address that will receive BPS fee on each sale          

### Run the app

Once you have your setup ready, run:

With yarn:

    $ yarn dev

With npm:

    $ npm run dev

### Deploy with Vercel

This is a Next.js app that can be easily deployed using  [Vercel](https://vercel.com/). For  more information on how to deploy your Github reposistory with Vercel visit their [docs](https://vercel.com/docs/concepts/projects/overview).

<p align="right">(<a href="#top">back to top</a>)</p>


<!-- CONTACT -->
## Contact

Twitter: [@reservoir0x](https://twitter.com/reservoir0x)
Discord: [Reservoir Protocol](https://discord.gg/j5K9fESNwh)
Project Link: [Reservoir Protocol](https://reservoirprotocol.github.io/)

<p align="right">(<a href="#top">back to top</a>)</p>