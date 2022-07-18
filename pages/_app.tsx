import 'styles/globals.css'
import 'styles/inter.css'
import 'styles/druk.css'
import 'styles/montserrat.css'
import 'styles/open-sans.css'
import 'styles/playfair-display.css'
import 'styles/roboto.css'
import 'styles/chalkboard.css'
import 'styles/frankruhllibre.css'
import 'styles/gazpacho.css'
import 'styles/editorialnew.css'
import 'styles/lucidagrande.css'
import 'styles/nunitosans.css'
import 'styles/styreneb.css'
import 'styles/gothicusroman.css'
import 'styles/roobert.css'
import 'styles/rodger.css'
import type { AppProps } from 'next/app'
import {
  WagmiConfig,
  chain,
  createClient,
  allChains,
  configureChains,
} from 'wagmi'
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { publicProvider } from 'wagmi/providers/public'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { GlobalProvider } from 'context/GlobalState'
import AnalyticsProvider from 'components/AnalyticsProvider'
import { ThemeProvider } from 'next-themes'
import { ReservoirSDK } from '@reservoir0x/client-sdk'
import { getDefaultProvider } from 'ethers'

// Select a custom ether.js interface for connecting to a network
// Reference = https://wagmi-xyz.vercel.app/docs/provider#provider-optional
// OPTIONAL
const infuraId = process.env.NEXT_PUBLIC_INFURA_ID

// API key for Ethereum node
// Two popular services are Alchemy (alchemy.com) and Infura (infura.io)
const alchemyId = process.env.NEXT_PUBLIC_ALCHEMY_ID

const THEME_SWITCHING_ENABLED = process.env.NEXT_PUBLIC_THEME_SWITCHING_ENABLED
const DARK_MODE_ENABLED = process.env.NEXT_PUBLIC_DARK_MODE
const RESERVOIR_API_BASE = process.env.NEXT_PUBLIC_RESERVOIR_API_BASE

// Set up chains
const { chains, provider } = configureChains(allChains, [
  alchemyProvider({ alchemyId }),
  publicProvider(),
])

// Set up connectors
const client = createClient({
  autoConnect: true,
  provider,
  connectors: [
    new InjectedConnector({
      chains,
      options: { name: 'Injected' },
    }),
    new WalletConnectConnector({
      chains,
      options: {
        qrcode: true,
      },
    }),
    new CoinbaseWalletConnector({
      chains,
      options: {
        appName: 'reservoir.market',
      },
    }),
  ],
})

ReservoirSDK.init({
  apiBase: RESERVOIR_API_BASE ? RESERVOIR_API_BASE : '',
})

function MyApp({ Component, pageProps }: AppProps) {
  const defaultTheme = DARK_MODE_ENABLED ? 'dark' : 'light'

  return (
    <GlobalProvider>
      <WagmiConfig client={client}>
        <AnalyticsProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme={defaultTheme}
            forcedTheme={!THEME_SWITCHING_ENABLED ? defaultTheme : undefined}
          >
            <Component {...pageProps} />
          </ThemeProvider>
        </AnalyticsProvider>
      </WagmiConfig>
    </GlobalProvider>
  )
}

export default MyApp
