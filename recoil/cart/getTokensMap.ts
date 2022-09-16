import { selector } from 'recoil'
import recoilCartTokens from 'recoil/cart/atom'

export default selector({
  key: 'cartMapping',
  get: ({ get }) => {
    const arr = get(recoilCartTokens)

    return arr.reduce<Record<string, any>>((map, token) => {
      if (token?.token) {
        map[`${token.token.contract}:${token.token.tokenId}`] = true
      }
      return map
    }, {})
  },
})
