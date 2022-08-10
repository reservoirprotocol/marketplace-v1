import { paths } from '@reservoir0x/reservoir-kit-client'

type TokenSale = NonNullable<
  paths['/sales/v3']['get']['responses']['200']['schema']['sales']
>[0]

type Collection =
  paths['/collection/v3']['get']['responses']['200']['schema']['collection']

type TokenDetails = NonNullable<
  NonNullable<
    paths['/tokens/details/v4']['get']['responses']['200']['schema']['tokens']
  >[0]['token']
>

type TokenDetailsAttribute = NonNullable<TokenDetails['attributes']>[0]
