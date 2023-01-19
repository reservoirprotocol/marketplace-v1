import { Token } from 'recoil/cart/atom'
import { PricingPool } from 'recoil/cart/getPricingPools'

export const getPricing = (
  cartPools: Record<string, PricingPool>,
  token?: Partial<Token>
) => {
  const tokenId = `${token?.token?.contract}:${token?.token?.tokenId}`
  let price = token?.market?.floorAsk?.price

  const pool = token?.market?.floorAsk?.dynamicPricing?.data?.pool
    ? cartPools[token?.market.floorAsk.dynamicPricing.data.pool as string]
    : null

  if (pool) {
    if (pool.tokenPrices[tokenId]) {
      price = pool.tokenPrices[tokenId]
    } else if (pool.prices[pool.tokenOrder.length]) {
      price = pool.prices[pool.tokenOrder.length]
    } else {
      return undefined
    }
  }
  return price
}
