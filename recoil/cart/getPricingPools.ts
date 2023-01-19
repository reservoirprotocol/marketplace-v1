import { selector } from 'recoil'
import recoilCartTokens, { Token } from 'recoil/cart/atom'

type TokenPrice = NonNullable<NonNullable<Token['market']['floorAsk']>['price']>
type PoolPrice = {
  amount: TokenPrice['amount']
  currency: TokenPrice['currency']
}

export type PricingPool = {
  prices: PoolPrice[]
  tokenOrder: string[]
  tokenPrices: Record<string, PoolPrice>
}

export default selector({
  key: 'pricingPools',
  get: ({ get }) => {
    const pools: Record<string, PricingPool> = {}
    get(recoilCartTokens).forEach((token) => {
      const tokenId = `${token.token.contract}:${token.token.tokenId}`
      const dynamicPricing = token.market.floorAsk?.dynamicPricing
      const poolId = dynamicPricing?.data?.pool as string
      if (dynamicPricing?.kind === 'pool' && dynamicPricing.data?.prices) {
        const prices = dynamicPricing.data.prices as PricingPool['prices']
        if (!pools[poolId]) {
          pools[poolId] = {
            prices,
            tokenOrder: [tokenId],
            tokenPrices: {
              [tokenId]: prices[0],
            },
          }
        } else {
          pools[poolId].prices = prices
          pools[poolId].tokenOrder.push(tokenId)
          pools[poolId].tokenPrices[tokenId] =
            prices[pools[poolId].tokenOrder.indexOf(tokenId)]
        }
      }
    })
    return pools
  },
})
