import React, { FC, Fragment } from 'react'
import { Transition } from '@headlessui/react'
import toast, { Toast } from 'react-hot-toast'
import {
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlineInformationCircle,
  HiOutlineXCircle,
  HiX,
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
    <div className="flex w-full max-w-sm flex-col items-center space-y-4 sm:items-end">
      <Transition
        show={t.visible}
        as={Fragment}
        enter="transform ease-out duration-300 transition"
        enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
        enterTo="translate-y-0 opacity-100 sm:translate-x-0"
        leave="transition ease-in duration-100"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-black dark:ring-neutral-600">
          <div className="p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">{icons[kind]}</div>
              <div className="ml-3 w-0 flex-1 pt-0.5">
                <p className="font-medium text-gray-900 dark:text-white">
                  {title}
                </p>
                <p className="mt-1 text-gray-500 dark:text-neutral-300">
                  {message}
                </p>
              </div>
              <div className="ml-4 flex flex-shrink-0">
                <button
                  className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-black dark:text-white"
                  onClick={() => toast.dismiss(t.id)}
                >
                  <span className="sr-only">Close</span>
                  <HiX className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  )
}

export default Toast

const icons = {
  error: <HiOutlineXCircle className="h-6 w-6 rounded-full text-red-400" />,
  success: (
    <HiOutlineCheckCircle className="h-6 w-6 rounded-full text-green-400" />
  ),
  warning: (
    <HiOutlineExclamationCircle className="h-6 w-6 rounded-full text-yellow-400" />
  ),
  info: (
    <HiOutlineInformationCircle className="h-6 w-6 rounded-full text-blue-400" />
  ),
}
