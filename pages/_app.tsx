import 'styles/globals.css'
import type { AppProps } from 'next/app'
import { Provider } from 'wagmi'
import { providers } from 'ethers'
import { GlobalProvider } from 'context/GlobalState'

const infuraId = process.env.NEXT_PUBLIC_INFURA_ID

const provider = ({ chainId }: { chainId?: number }) =>
  new providers.InfuraProvider(chainId, infuraId)

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <GlobalProvider>
      <Provider provider={provider} autoConnect>
        <Component {...pageProps} />
      </Provider>
    </GlobalProvider>
  )
}

export default MyApp
