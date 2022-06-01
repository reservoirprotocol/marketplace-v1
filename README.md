<h3 align="center">Reservoir Market</h3>
  <p align="center">
An open source NFT marketplace built on Reservoir.

<!-- ABOUT THE PROJECT -->
## About The Project


Reservoir Market is an open source marketplace that enables communities to easily launch their own NFT marketplace, accessing instant liquidity aggregated from other major marketplaces.

The marketplace supports 3 different modes:

-   Single collection (e.g.  [Crypto Coven](https://cryptocoven.reservoir.market/))
![crytocoven-screen](https://user-images.githubusercontent.com/96800113/170140995-6bf22f44-0887-4f50-93d8-cda0dc51bf7d.png)

-   Multi collection community (e.g.  [BAYC](https://bayc.reservoir.market/))
![bayc-screen](https://user-images.githubusercontent.com/96800113/170141023-3ec88b7d-bbab-43b8-a0e4-8792c5235057.png)

-   All collections ([example](https://www.reservoir.market/))
![general-screen](https://user-images.githubusercontent.com/96800113/170141225-422ec020-86ba-41b0-ba12-085e9617eaf8.png)

  
With each deployment, communities are given full control over their marketplace from designing their look and feel to setting their own marketplace fees.

We currently offer hosted and self hosted deployment options. For self hosted deployments you can simply fork this repository and follow the instructions below to configure and deploy your marketplace. For hosted deployments please submit your request and we will be in touch.

[Submit your request for a Hosted Deployment here.](https://forms.gle/o6mbPJb7bwaG22pm6)

<p align="right">(<a href="#top">back to top</a>)</p>



<!-- GETTING STARTED -->
## Getting Started (Self-Hosted)

### Prerequisites
1. Install [Node.js and NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
2. Install [Yarn](https://classic.yarnpkg.com/en/docs/install)
3. Request free [Reservoir API key](https://api.reservoir.tools/#/0.%20Auth/postApikeys)

### Built With

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
Reservoir Market is built to be fully configurable using environment variables. To preview your configuration locally you can copy the values you want to use from  `env.development`  or  `env.production`  into a new file called  `.env.local`

Note: Environment variables can also be added during deployment via deployment platforms like [vercel](https://vercel.com/).

**Admin Configuration**
| Environment Variable           | Required | Description                                                                         | Example              |
|--------------------------------|----------|-------------------------------------------------------------------------------------|---------------------|
| NEXT_PUBLIC_CHAIN_ID           | `true`   | The Reservoir API base URL. Available on Mainnet and Rinkeby.                       | https://api-rinkeby.reservoir.tools/ https://api.reservoir.tools/ |
| NEXT_PUBLIC_RESERVOIR_API_BASE | `true`   | The Ethereum network to be used. 1 for Etherem Mainnet and 4 for Rinkeby Testnet.   | 1 4                                                               |
| NEXT_PUBLIC_PROXY_API_BASE     | `true`   | The proxy API used to pass the Reservoir API key without exposing it to the client. | /api/reservoir                                                    |
| RESERVOIR_API_KEY              | `true`   | Reservoir API key provided by the Reservoir Protocol. Get your own API key.         | 123e4567-e89b-12d3-a456-426614174000                              |
| NEXT_PUBLIC_DATADOG_CLIENT_TOKEN    | `false`  | Datadog client token for configuring analytics                               | pub4bec8e12715ec3458fe1acced2bidb361                                  |      
| NEXT_PUBLIC_DATADOG_APPLICATION_ID    | `false`  | Datadog application id for configuring analytics                               | 1dabcdadaad-3577-125a-b412-815faf31sfsd190                                  |      

**Marketplace Configuration**
| Environment Variable                | Required | Description                                                                     | Example             |
|-------------------------------------|----------|---------------------------------------------------------------------------------|---------------------|
| NEXT_PUBLIC_SOURCE_ID               | `true`   | The source ID used to attribute listings and offers from your marketplace.                                                                                           | Reservoir Market                              |                                                                                                                                |                                                  |
| NEXT_PUBLIC_ORDER_KIND              | `false`  | The default order kind to the be used when listing or making offers on your marketplace.                                                                             | zeroex-v4 wyvern-v2.3                         |                                                                                                                                |                                                  |
| NEXT_PUBLIC_FEE_BPS                 | `false`  | The marketplace fee that will be earned from native listings and offers on your marketplace. Configured as basis points - eg. 100 = 1%, 1000 = 10% and 10000 = 100%. | 100                                           |                                                                                                                                |                                                  |
| NEXT_PUBLIC_FEE_RECIPIENT           |          | The address that will receive marketplace fee.                                                                                                                       | 0xff9c1b15b16263c61d017ee9f65c50e4ae0113d7    |                                                                                                                                |                                                  |
| NEXT_PUBLIC_COLLECTION              | `false`  | Use this to configure a single collection marketplace or set the default collection for your community marketplace.                                                  | 0xff9c1b15b16263c61d017ee9f65c50e4ae0113d7    |                                                                                                                                |                                                  |
| NEXT_PUBLIC_COMMUNITY               | `false`  | Use this to configure a community marketplace. Note: NEXT_PUBLIC_COLLECTION must also be set when creating community marketplaces.                                   | bayc forgottenrunes artblocks azuki           |                                                                                                                                |                                                  |
| NEXT_PUBLIC_OPENSEA_CROSS_POST      | `false`  | When enabled users will have the ability to cross post listings to OpenSea                                  | true          |                                                                                                                                |                                                  |
| NEXT_PUBLIC_EXTERNAL_LINKS          | `false`  | External links to be displayed in the top navigation bard.                                                                                                           | Blog::https://blog.com,Docs::https://docs.com |                                                                                                                                |                                                  |
| NEXT_PUBLIC_COLLECTION_DESCRIPTIONS | `false`  | Customize descriptions on a per collection basis                                                                                                                                                                              | 0xb74bf94049d2c01f8805b8b15db0909168cabf46::\`test description\`,0xc751c84678d8e229e361f9b04c080256516f4a0a::\`another description\` |
| NEXT_PUBLIC_NAVBAR_LOGO_LINK | `false`  | Customize the marketplace navabar logo's link                                                                                                                                     | https://blog.com |

**Design Configuration**
| Environment Variable              | Required | Description                                                                                                              | Example                                                                              |
|-----------------------------------|----------|--------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------|
| NEXT_PUBLIC_NAVBAR_LOGO           | `false`  | The logo of your marketplace that appears on mobile                                                                      | https://www.reservoir.market/reservoir.svg                                           |
| NEXT_PUBLIC_DESKTOP_NAVBAR_LOGO   | `false`  | The logo of your marketplace that appears on desktop                                                                     | https://www.reservoir.market/reservoir-desktop.svg                                   |
| NEXT_PUBLIC_FAVICON               | `false`  | The favicon for your marketplace                                                                                         | https://www.reservoir.market/reservoir.svg                                           |
| NEXT_PUBLIC_DARK_MODE             | `false`  | Use this to enable dark mode theme.                                                                                      | True                                                                                 |
| NEXT_PUBLIC_PRIMARY_COLOR         | `false`  | Use this to select your primary color.                                                                                   | default red orange lime green blue                                                   |
| NEXT_PUBLIC_FONT_FAMILY           | `false`  | Primary sans font used in your marketplace.                                                                              | Inter, Montserrat, Open Sans, Playfair Display, Roboto, Druk, Nunito Sans, Lucida Grande, Gazpacho, Frank Ruh Libre, Chalkboard, Gothicus Roman, Styrene B Black, Montserrat Uppercase Bold Italic |
| NEXT_PUBLIC_FONT_URL           | `false`  | Use in conjunction with `NEXT_PUBLIC_FONT_FAMILY` to pull in a remote font, using services like google fonts, adobe fonts etc.                                                                               | https://fonts.googleapis.com/css2?family=Blaka&display=swap |
| NEXT_PUBLIC_BANNER_IMAGE          | `false`  | The background banner image used on collection pages. If not set this will use the default collection banner.            | /banner.png                                                                          |
| NEXT_PUBLIC_DISABLE_COLLECTION_BG | `false`  | Use this to hide the background banners on collection pages.                                                             | true                                                                                 |
| NEXT_PUBLIC_TAGLINE               | `false`  | A tagline to be displayed in the homepage. Only available if NEXT_PUBLIC_COLLECTION and NEXT_PUBLIC_COMMUNITY are unset. | Buy, sell and collect NFTs!                                                          |

**SEO Configuration**
| Environment Variable         | Required | Description                                                                                             | Example                                                                  |
|------------------------------|----------|---------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------|
| NEXT_PUBLIC_META_TITLE       | `false`  | The text used in the <title> tag.                                                                       | Reservoir Market \| Open Source NFT Marketplace                          |
| NEXT_PUBLIC_META_DESCRIPTION | `false`  | The text used in the meta description <meta name="description" content={NEXT_PUBLIC_META_DESCRIPTION}/> | Reservoir Market is an open source NFT marketplace built with Reservoir. |
| NEXT_PUBLIC_META_OG_IMAGE    | `false`  | The image used in the meta og images <meta name="twitter:image" content={NEXT_PUBLIC_META_OG_IMAGE}/>   | https://www.reservoir.market/og.png                                      |


### Run the App

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
