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
    <div className="mb-10">
      {steps?.map(({ action, description, status, message, error }, index) => (
        <div className="mb-5 flex gap-3" key={action + index}>
          <div className="h-10 w-10">
            {error ? (
              <HiXCircle className="mx-auto -mt-1 h-10 w-10 flex-none text-red-600" />
            ) : status === 'complete' ? (
              <HiCheckCircle className="mx-auto -mt-1 h-10 w-10 flex-none text-green-600" />
            ) : firstIncomplete === index ? (
              <svg
                className="mr-1 ml-1 -mt-0.5 h-8 w-8 flex-none animate-spin text-black"
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
              <div className="mr-1 ml-1 flex h-8 w-8 items-center justify-center rounded-full text-center text-lg font-semibold ring-2 ring-inset ring-neutral-900">
                <div>{index + 1}</div>
              </div>
            )}
          </div>
          <div>
            <div className="mb-1 mt-0.5 font-semibold">{action}</div>
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
