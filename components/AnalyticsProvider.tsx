// import useDataDog from 'hooks/useAnalytics'
import { FC, ReactElement, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { datadogRum } from '@datadog/browser-rum'

const env = process.env.NODE_ENV
const ddApplicationId = process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID
const ddClientToken = process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN
const SOURCE_ID = process.env.NEXT_PUBLIC_SOURCE_ID

type Props = {
  children: ReactElement
}

const AnalyticsProvider: FC<Props> = ({ children }) => {
  const { data: accountData } = useAccount()

  useEffect(() => {
    if (accountData) {
      datadogRum.setUser({
        id: accountData.address?.toLowerCase(),
      })
    }
  }, [accountData])

  useEffect(() => {
    if (typeof window !== 'undefined' && !datadogRum.getInitConfiguration()) {
      if (!ddApplicationId || !ddClientToken) return

      datadogRum.init({
        applicationId: ddApplicationId,
        clientToken: ddClientToken,
        site: 'datadoghq.com',
        service: SOURCE_ID || 'sample-marketplace',
        env,
        sampleRate: 100,
        replaySampleRate: 100,
        trackInteractions: true,
        defaultPrivacyLevel: 'mask-user-input',
      })

      datadogRum.startSessionReplayRecording()
    }
  }, [])

  return children
}

export default AnalyticsProvider
