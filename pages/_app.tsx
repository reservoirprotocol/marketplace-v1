import 'styles/globals.css'
import 'styles/inter.css'
import type { AppProps } from 'next/app'
import { Provider } from 'wagmi'
import { providers } from 'ethers'

// Select a custom ether.js interface for connecting to a network
// Reference = https://wagmi-xyz.vercel.app/docs/provider#provider-optional
// OPTIONAL
const infuraId = process.env.NEXT_PUBLIC_INFURA_ID

const provider = ({ chainId }: { chainId?: number }) =>
  new providers.InfuraProvider(chainId, infuraId)

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider provider={provider} autoConnect>
      <Component {...pageProps} />
    </Provider>
  )
}

export default MyApp
