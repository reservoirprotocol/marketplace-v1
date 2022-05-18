import React, { FC } from 'react'
import { HiCheckCircle, HiXCircle } from 'react-icons/hi'
import { CgSpinner } from 'react-icons/cg'
import { Execute } from '@reservoir0x/client-sdk'

type Props = {
  steps: Execute['steps']
}

const Steps: FC<Props> = ({ steps }) => {
  const firstIncomplete = steps?.findIndex(
    ({ status }) => status === 'incomplete'
  )

  return (
    <div className="mb-10">
      {steps?.map(({ action, description, status, message, error }, index) => (
        <div className="mb-5 flex gap-3" key={action + index}>
          <div className="h-10 w-10">
            {error ? (
              <HiXCircle className="mx-auto -mt-1 h-10 w-10 flex-none text-red-600" />
            ) : status === 'complete' ? (
              <HiCheckCircle className="mx-auto -mt-1 h-10 w-10 flex-none text-green-600" />
            ) : firstIncomplete === index ? (
              <CgSpinner className="mr-1 ml-1 -mt-0.5 h-8 w-8 flex-none animate-spin text-black dark:text-white" />
            ) : (
              <div className="reservoir-h6 mr-1 ml-1 flex h-8 w-8 items-center justify-center rounded-full text-center font-headings ring-2 ring-inset ring-neutral-900 dark:text-white  dark:ring-white">
                <div>{index + 1}</div>
              </div>
            )}
          </div>
          <div>
            <div className="reservoir-h6 mb-1 mt-0.5 font-headings dark:text-white">
              {action}
            </div>
            {error && (
              <div className="reservoir-h6 mb-2.5 font-headings text-red-800 dark:text-white">
                {error}
              </div>
            )}
            {firstIncomplete === index && (
              <>
                <div className="reservoir-body mb-2.5 dark:text-white">
                  {description}
                </div>
                {message && (
                  <div className="reservoir-body italic dark:text-white">
                    {message}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default Steps
