import { selector } from 'recoil'
import recoilCartTokens from 'recoil/cart/atom'

export default selector({
  key: 'cartTotal',
  get: ({ get }) => {
    return get(recoilCartTokens).reduce((total, token) => {
      if (token?.market?.floorAsk?.price?.amount?.native) {
        total += token.market.floorAsk.price.amount.native
      }
      return total
    }, 0)
  },
})
