import React, { FC } from 'react'
import toast, { Toast } from 'react-hot-toast'
import {
  HiCheckCircle,
  HiExclamationCircle,
  HiInformationCircle,
  HiXCircle,
} from 'react-icons/hi'

type Props = {
  t: Toast
  toast: typeof toast
  data: {
    kind: 'error' | 'success' | 'warning' | 'info'
    title: string
    message: string
  }
}

const Toast: FC<Props> = ({ t, toast, data: { kind, message, title } }) => {
  return (
    <div
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } pointer-events-auto flex w-full max-w-md rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5`}
    >
      <div className="w-0 flex-1 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">{icons[kind]}</div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900">{title}</p>
            <p className="mt-1 text-sm text-gray-500">{message}</p>
          </div>
        </div>
      </div>
      <div className="flex border-l border-gray-200">
        <button
          onClick={() => toast.dismiss(t.id)}
          className="flex w-full items-center justify-center rounded-none rounded-r-lg border border-transparent p-4 text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Close
        </button>
      </div>
    </div>
  )
}

export default Toast

const icons = {
  error: <HiXCircle className="h-10 w-10 rounded-full text-red-700" />,
  success: <HiCheckCircle className="h-10 w-10 rounded-full text-green-700" />,
  warning: (
    <HiExclamationCircle className="h-10 w-10 rounded-full text-yellow-700" />
  ),
  info: (
    <HiInformationCircle className="h-10 w-10 rounded-full text-blue-700" />
  ),
}
