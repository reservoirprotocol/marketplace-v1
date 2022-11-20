import { MagicConnectConnector } from '@everipedia/wagmi-magic-connector';
import { ETH_GOERLI_API_BASE_URL, MAGIC_CONNECT_API_KEY, MAGIC_CONNECT_ICON, PUBLIC_CHAIN_ID } from '../constants'
import primaryColors from '../colors'

export const rainbowMagicConnector = ({ chains }: any) => {
  return {
    id: 'magic',
    name: 'Magic',
    iconUrl: MAGIC_CONNECT_ICON,
    iconBackground: primaryColors.gray['100'],
    createConnector: () => {
      const connector = new MagicConnectConnector({
        chains: chains,
        options: {
          apiKey: MAGIC_CONNECT_API_KEY,
          magicSdkConfiguration: {
            network: {
              rpcUrl: ETH_GOERLI_API_BASE_URL,
              chainId: PUBLIC_CHAIN_ID
            },
          },
        },
      });
      return {
        connector,
      };
    },
  }
}
