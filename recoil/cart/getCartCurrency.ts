import { selector } from 'recoil'
import recoilCartTokens from 'recoil/cart/atom'

export default selector({
  key: 'cartCurrency',
  get: ({ get }) => {
    const tokens = get(recoilCartTokens)
    return tokens && tokens[0]
      ? tokens[0].market.floorAsk?.price?.currency
      : null
  },
})
