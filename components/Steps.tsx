import { Execute } from 'lib/executeSteps'
import React, { FC, useEffect, useState } from 'react'
import { HiCheckCircle, HiMinusCircle } from 'react-icons/hi'

type Props = {
  steps: Execute['steps']
}

const Steps: FC<Props> = ({ steps }) => {
  const [loadingSteps, setloadingSteps] = useState<Execute['steps']>()

  useEffect(() => {
    if (steps) {
      const firstIncomplete = steps.findIndex(
        ({ status }) => status === 'incomplete'
      )
      if(firstIncomplete>-1) {
        steps[firstIncomplete].loading = true
      }
      setloadingSteps(steps)
    }
  }, [steps])

  return (
    <div className="my-4">
      {loadingSteps
        ?.filter(({ kind }) => kind !== 'confirmation')
        .map(({ action, description, status, loading }, index) => (
          <div className="mb-3 flex gap-2" key={action + index}>
            {status === 'complete' && (
              <HiCheckCircle className="mt-0.5 h-6 w-6 text-green-600" />
            )}
            {status === 'incomplete' && !loading && (
              <HiMinusCircle className="mt-0.5 h-6 w-6 text-neutral-600" />
            )}
            {loading && (
              <svg
                className="mt-1 mr-1 h-5 w-5 animate-spin text-black"
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
            )}
            <div>
              <div className="font-semibold">{action}</div>
              <div>{description}</div>
            </div>
          </div>
        ))}
    </div>
  )
}

export default Steps
