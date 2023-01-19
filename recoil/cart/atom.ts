import { useTokens } from '@reservoir0x/reservoir-kit-ui'
import { atom } from 'recoil'

type UseTokensReturnType = ReturnType<typeof useTokens>

export type Token = {
  token: NonNullable<
    NonNullable<NonNullable<UseTokensReturnType['data']>[0]>['token']
  >
  market: NonNullable<
    NonNullable<NonNullable<UseTokensReturnType['data']>[0]>['market']
  >
}

export default atom<Token[]>({
  key: 'cartTokens',
  default: [],
})
