import { selector } from 'recoil'
import recoilCartTokens, { getPricingPools } from 'recoil/cart'

export default selector({
  key: 'cartTotal',
  get: ({ get }) => {
    const pricingPools = get(getPricingPools)
    return get(recoilCartTokens).reduce((total, token) => {
      let price = token?.market?.floorAsk?.price?.amount?.decimal
      const pool =
        pricingPools[
          token.market.floorAsk?.dynamicPricing?.data?.pool as string
        ]
      if (pool) {
        const tokenId = `${token.token.contract}:${token.token.tokenId}`
        if (pool.tokenPrices[tokenId]?.amount?.decimal) {
          price = pool.tokenPrices[tokenId].amount?.decimal
        } else if (pool.prices[pool.tokenOrder.length].amount?.decimal) {
          price = pool.prices[pool.tokenOrder.length]?.amount?.decimal
        }
      }
      if (price) {
        total += price
      }
      return total
    }, 0)
  },
})
