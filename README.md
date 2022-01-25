# Sample Marketplace

Use this example project to get yourself familiarized with the Reservoir API.

## Live Example

You first have the option to see a live example using the collection ids as subdomains:

`https://{collectionId}.reservoir.market`

For example, you can see the _Bored Ape Yatch Club_ collection at https://boredapeyachtclub.reservoir.market, or the _Ringers by Dmitri Cherniak_ collection at https://ringers-by-dmitri-cherniak.reservoir.market/.

## Get started

To start developing with Reservoir, fork this repository and follow these instructions:

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

You need to provide an Infura ID to get blockchain data and an OpenSea API key if you want to interact with OpenSea from the app.

```
NEXT_PUBLIC_INFURA_ID=
NEXT_PUBLIC_OPENSEA_API_KEY=
```

Setup your `.env.local` file with this command.

```bash
touch .env.local && \
echo 'NEXT_PUBLIC_INFURA_ID=\nNEXT_PUBLIC_OPENSEA_API_KEY=' >> .env.local
```

There are also two more environment variables provided in this repo:

`NEXT_PUBLIC_CHAIN_ID` is the Ethereum Chain ID. Use 1 for Ethereum Mainnet and 4 for Rinkeby Testnet.

`NEXT_PUBLIC_API_BASE` is the base url for the Reservoir API. This will vary depending on the Node.js environment the app is running on.

Note: The Reservoir base URL changes with each new version, so make sure to check our releases to get the latest API features.

Also, remember setup these environment variables where you host your application.

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

Then navigate to http://localhost:3000 in your browser.
