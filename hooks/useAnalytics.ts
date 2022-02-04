import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { datadogRum } from '@datadog/browser-rum'

const env = process.env.NODE_ENV
const ddApplicationId = process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID
const ddClientToken = process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN

/**
 * Proxy Real User Monitoring Data (DataDog)
 * @param data wagmi data object containing the user Ethereum address
 */
export default function useDataDog(
  data: ReturnType<typeof useAccount>['0']['data']
) {
  const [isDatadogRunning, setisDatadogRunning] = useState(false)

  if (typeof window !== 'undefined' && !isDatadogRunning) {
    const origin = window.location.origin

    if (!ddApplicationId || !ddClientToken) return

    let url = new URL('/api/dd', origin)

    datadogRum.init({
      applicationId: ddApplicationId,
      clientToken: ddClientToken,
      site: 'datadoghq.com',
      service: 'sample-marketplace',
      proxyUrl: url.href,
      env,
      sampleRate: 100,
      replaySampleRate: 100,
      trackInteractions: true,
      defaultPrivacyLevel: 'mask-user-input',
    })

    datadogRum.startSessionReplayRecording()
    setisDatadogRunning(true)
  }

  useEffect(() => {
    if (data) {
      datadogRum.setUser({
        id: data.address.toLowerCase(),
      })
    }
  }, [data])
}
