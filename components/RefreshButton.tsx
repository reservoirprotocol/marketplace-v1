import { DateTime } from 'luxon'
import router from 'next/router'
import { Dispatch, FC, SetStateAction, useEffect, useRef, useState } from 'react'
import { FiRefreshCcw } from 'react-icons/fi'

type Props = {
  refreshData: () => void
  isLoading: boolean
  setIsLoading: Dispatch<SetStateAction<boolean>>
}

const RefreshButton: FC<Props> = ({ refreshData, isLoading, setIsLoading }) => {
  const [lastUpdated, setLastUpdated] = useState<DateTime>(DateTime.now())
  const [timeDifference, setTimeDifference] = useState<string | undefined>('just now')
  const countRef = useRef(lastUpdated);

  // Handle button click
  const handleRefreshData = async () => {
    setIsLoading(true)
    refreshData()
    setLastUpdated(DateTime.now())
    setTimeDifference('just now')
    await new Promise((resolve) => { setTimeout(resolve, 500)})
    setIsLoading(false)
  }

  // Handle route change
  useEffect(() => {
    const handleRouteChange = async () => {
      setIsLoading(true)
      setLastUpdated(DateTime.now())
      setTimeDifference('just now')
      await new Promise(resolve => setTimeout(resolve, 500))
      setIsLoading(false)
    }
    router.events.on('routeChangeStart', handleRouteChange)

    return () => {
      router.events.off('routeChangeStart', handleRouteChange)
    }
  }, [])

  useEffect(() => {
    countRef.current = lastUpdated;
  }, [lastUpdated]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeDifference(countRef.current.plus({ seconds: 0 }).toRelative()?.replace(' seconds', 's')
      .replace(' second', 's')
      .replace(' minutes', 'm')
      .replace(' minute', 'm')
      .replace(' hour', 'hr')
      .replace(' hours', 'hr'))
    }, 30000);

    return () => clearInterval(interval);
  }, [lastUpdated]);

  return (
    <div className='hidden lg:flex inline-flex items-center font-light min-w-70'>
      <button
        onClick={() => handleRefreshData()}
        className='btn-primary-outline px-2 rounded-full mr-2 border-none hover:border'
      >
        <FiRefreshCcw
          className='h-5 w-5'
        />
      </button>
      <span className='min-w-[140px]'>
        {isLoading
          ?
          'Loading items...'
          :
          `Updated ${timeDifference}`
        }
      </span>
    </div>
  )
}

export default RefreshButton
