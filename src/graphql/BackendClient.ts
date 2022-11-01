import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'
import { globalConfig } from '../globalConfig'

export const backendClient = new ApolloClient({
  ssrMode: typeof window === 'undefined',
  link: new HttpLink({
    uri: globalConfig.nftfyBackend
  }),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          buyFloor: {
            keyArgs: ['chainId', 'filterBy', 'orderBy', 'orderDirection'],
            merge(existing = [], incoming = []) {
              const filteredIncoming = incoming.filter(
                (incomingItem: { __ref: string }) =>
                  existing.filter((existingItem: { __ref: string }) => existingItem.__ref === incomingItem.__ref).length === 0
              )
              return [...existing, ...filteredIncoming]
            }
          },
          listBuyFloorCollections: {
            keyArgs: ['chainId'],
            merge(existing = [], incoming = []) {
              const filteredIncoming = incoming.filter(
                (incomingItem: { __ref: string }) =>
                  existing.filter((existingItem: { __ref: string }) => existingItem.__ref === incomingItem.__ref).length === 0
              )
              return [...existing, ...filteredIncoming]
            }
          }
        }
      }
    }
  }),
  connectToDevTools: true
})
