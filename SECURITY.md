### Listing

Reservoir aggregates different NFT exchange protocols, allowing you to access them all through a single, simplified interface. All supported protocols have undergone extensive audits:

- [Wyvern](https://github.com/ProjectWyvern/wyvern-ethereum/tree/master/audits/v2) (used by OpenSea)
- [0xV4](https://s3.us-east-2.amazonaws.com/zeips.0x.org/audits/abdk-consulting/ABDK_0x_Solidity_v_1_0.pdf) (used by Coinbase, Trader.xyz)
- [LooksRare](https://github.com/trailofbits/publications/blob/master/reviews/LooksRare.pdf)

When you list an NFT through a Reservoir-powered marketplace, the listing happens through one of the above protocols. By default, 0xV4 is used, but each team who deploys a marketplace chooses which to use. 

To list, you must approve the exchange contract to transfer your tokens. This is exactly the same as if you listed directly on another marketplace. In fact, if you have already approved a particular exchange contract through OpenSea, Coinbase or LooksRare, you don’t need to do it again on a Reservoir-powered marketplace. You’re approving the underlying exchange, not Reservoir.

### Purchasing

All sales are executed through Reservoir’s Router contract. This allows purchasing from multiple different marketplaces, and advanced features like sweeping. THIS CONTRACT DOES NOT HOLD ANY USER FUNDS, OR EVEN PERMISSION TO SPEND USER FUNDS. All actions must be directly approved by the user, on a per transaction basis. This gives it a very different security profile to the exchange contracts above, or DeFi protocols.

Because this contract is still under rapid development (e.g. adding support for new exchange protocols), it has not yet undergone a full audit. That said we are planning the following measures to minimize risk:

- All code open-source for transparency 
- Periodic audits (first one is scheduled after Seaport integration is complete)
- Continuous bug bounty on Code4rena (launching soon)
- Ability for developers to "lock" to a stable, audited version
- Advocate for wallets to better "simulate" the impact of each transaction

### Deployed Contracts

- Mainnet: [0xc52b521b284792498c1036d4c2ed4b73387b3859](https://etherscan.io/address/0xc52b521b284792498c1036d4c2ed4b73387b3859)
- Rinkeby: [0xa5c0C6c024460b039B917a77EB564da5817c55E2](https://rinkeby.etherscan.io/address/0xa5c0C6c024460b039B917a77EB564da5817c55E2)

### Source Code

- [Router Contract](https://github.com/reservoirprotocol/core/blob/main/packages/contracts/contracts/router/RouterV2.sol)
- [Router API](https://github.com/reservoirprotocol/indexer/blob/v5/src/api/endpoints/execute/get-execute-buy/v2.ts)
- [SDK](https://github.com/reservoirprotocol/client-sdk)
- [Marketplace UI](https://github.com/reservoirprotocol/marketplace)
