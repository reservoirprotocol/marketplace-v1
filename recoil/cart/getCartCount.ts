import { selector } from 'recoil'
import recoilCartTokens from 'recoil/cart/atom'

export default selector({
  key: 'cartCount',
  get: ({ get }) => {
    const arr = get(recoilCartTokens)

    return arr.length
  },
})
