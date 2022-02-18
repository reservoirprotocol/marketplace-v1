import { Execute } from 'lib/executeSteps'
import React, { FC } from 'react'
import { HiCheckCircle, HiXCircle } from 'react-icons/hi'

type Props = {
  steps: Execute['steps']
}

const Steps: FC<Props> = ({ steps }) => {
  const firstIncomplete = steps?.findIndex(
    ({ status }) => status === 'incomplete'
  )

  return (
    <div className="my-4">
      {steps?.map(({ action, description, status, message, error }, index) => (
        <div className="mb-3 flex gap-2" key={action + index}>
          {error ? (
            <HiXCircle className="mt-0.5 h-6 w-6 flex-none text-red-600" />
          ) : status === 'complete' ? (
            <HiCheckCircle className="mt-0.5 h-6 w-6 flex-none text-green-600" />
          ) : firstIncomplete === index ? (
            <svg
              className="mt-1 mr-1 h-5 w-5 flex-none animate-spin text-black"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            <div className="w-6 text-center text-lg font-semibold">
              {index + 1}
            </div>
          )}
          <div>
            <div className="mb-1 font-semibold">{action}</div>
            {error && <div className="mb-2.5 text-red-800">{error}</div>}
            {firstIncomplete === index && (
              <>
                <div className="mb-2.5">{description}</div>
                {message && (
                  <div className="italic text-neutral-800">{message}</div>
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
