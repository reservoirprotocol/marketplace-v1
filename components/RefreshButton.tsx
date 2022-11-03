import { DateTime } from 'luxon'
import router from 'next/router'
import { FC, useEffect, useState } from 'react'
import { FiRefreshCcw } from 'react-icons/fi'

type Props = {
  refreshData: () => void
}

const RefreshButton: FC<Props> = ({ refreshData }) => {
  const [lastUpdated, setLastUpdated] = useState<DateTime>(DateTime.now())
  const [timeDifference, setTimeDifference] = useState<string | null>('0s ago')
  const [isLoading, setIsLoading] = useState(false)
  
  const handleRefreshData = async () => {
    setIsLoading(true)
    setLastUpdated(DateTime.now())
    await new Promise(resolve => setTimeout(resolve, 300))
    refreshData()
    setIsLoading(false)
  }

  useEffect(() => {
    const handleRouteChange = async () => {
      setIsLoading(true)
      setLastUpdated(DateTime.now())
      await new Promise(resolve => setTimeout(resolve, 500))
      setIsLoading(false)
    }
    router.events.on('routeChangeStart', handleRouteChange)

    return () => {
      router.events.off('routeChangeStart', handleRouteChange)
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeDifference(lastUpdated.plus({ seconds: 0 }).toRelative({ style: "narrow" }))
    }, 200);
    return () => clearInterval(interval);
  }, [lastUpdated]);

  return (
    <div className='flex inline-flex items-center font-light'>
      <button
        onClick={() => handleRefreshData()}
        className='btn-primary-outline px-2 rounded-full mr-2 border-none hover:border'
      >
        <FiRefreshCcw
          className='h-5 w-5'
        />
      </button>
      {isLoading
        ?
        <span>Loading items...</span>
        :
        <span>Updated {timeDifference}</span>
      }

    </div>
  )
}

export default RefreshButton
