import { FC } from 'react'
import { RiLoader5Line } from 'react-icons/ri'

const LoadingIcon: FC = () => {
  return (
    <RiLoader5Line className="h-16 w-16 animate-spin-loading text-primary-900" />
  )
}

export default LoadingIcon
