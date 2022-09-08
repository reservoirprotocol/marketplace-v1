import { selector } from 'recoil'
import recoilCartTokens from 'recoil/cart/atom'

export default selector({
  key: 'cartTotal',
  get: ({ get }) => {
    return get(recoilCartTokens).reduce((total, token) => {
      if (token?.market?.floorAsk?.price?.amount?.decimal) {
        total += token.market.floorAsk.price.amount.decimal
      }
      return total
    }, 0)
  },
})
