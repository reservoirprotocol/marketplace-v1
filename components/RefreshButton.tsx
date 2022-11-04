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
  const [timeDifference, setTimeDifference] = useState<string | null>('0s ago')

  const countRef = useRef(lastUpdated);
  countRef.current = lastUpdated;

  const handleRefreshData = async () => {
    setIsLoading(true)
    refreshData()
    setLastUpdated(DateTime.now())
    await new Promise((resolve) => { setTimeout(resolve, 500)})
    setIsLoading(false)
  }

  useEffect(() => {
    const handleRouteChange = async () => {
      setIsLoading(true)
      await new Promise(resolve => setTimeout(resolve, 500))
      setLastUpdated(DateTime.now())
      setIsLoading(false)
    }
    router.events.on('routeChangeStart', handleRouteChange)

    return () => {
      router.events.off('routeChangeStart', handleRouteChange)
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeDifference(countRef.current.plus({ seconds: 0 }).toRelative({style: 'narrow'}))
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className='flex inline-flex items-center font-light w-70'>
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
