<h3 align="center">Reservoir Market</h3>
  <p align="center">
An open source NFT marketplace built on Reservoir.    <br />
    <a href="https://reservoirprotocol.github.io/docs/protocol/intro/"><strong>Explore the docs »</strong></a>
    <br />

<!-- ABOUT THE PROJECT -->
## About The Project


Reservoir Market is an open source marketplace that enables communities to easily launch their own NFT marketplace, accessing instant liquidity aggregated from other major marketplaces.

The marketplace supports 3 different modes:

-   Single collection (e.g.  [Crypto Coven](https://cryptocoven.reservoir.market/))
-   Multi collection community (e.g.  [BAYC](https://bayc.reservoir.market/))
-   All collections ([example](https://www.reservoir.market/))

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
Reservoir Market is built to be fully configurable using environment variables. To preview your configuration locally you can copy the values you want to use from  `env.development`  or  `env.production`  into a new file called  `.env.local`

Note: Environment variables can also be added during deployment via deployment platforms like [vercel](https://vercel.com/).

**Admin Configuration**
| Environment Variable           | Required | Description                                                                         | Example                                                           |
|--------------------------------|----------|-------------------------------------------------------------------------------------|-------------------------------------------------------------------|
| NEXT_PUBLIC_CHAIN_ID           | 'true'   | The Reservoir API base URL. Available on Mainnet and Rinkeby.                       | https://api-rinkeby.reservoir.tools/ https://api.reservoir.tools/ |
| NEXT_PUBLIC_RESERVOIR_API_BASE | 'true'   | The Ethereum network to be used. 1 for Etherem Mainnet and 4 for Rinkeby Testnet.   | 1 4                                                               |
| NEXT_PUBLIC_PROXY_API_BASE     | 'true'   | The proxy API used to pass the Reservoir API key without exposing it to the client. | /api/reservoir                                                    |
| RESERVOIR_API_KEY              | 'true'   | Reservoir API key provided by the Reservoir Protocol. Get your own API key.         | 123e4567-e89b-12d3-a456-426614174000                              |
| NEXT_PUBLIC_OPENSEA_API_KEY    | 'false'  | OpenSea API key used to cross post orders to OpenSea.                               | 1a6c419a275c34de9d83df3dbe7ab890                                  |      

**Marketplace Configuration**


**Design Configuration**


**SEO Configuration**



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