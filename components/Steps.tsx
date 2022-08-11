import React, { FC } from 'react'
import { HiCheckCircle, HiXCircle } from 'react-icons/hi'
import { CgSpinner } from 'react-icons/cg'
import { Execute } from '@reservoir0x/reservoir-kit-client'

type Props = {
  steps: Execute['steps']
}

const Steps: FC<Props> = ({ steps }) => {
  const validSteps =
    steps?.filter((step) => step.items && step.items.length > 0) || []
  let firstIncompleteStepIndex = -1
  let firstIncompleteStepItemIndex = -1
  const firstIncompleteStep = validSteps.find((step, i) => {
    if (!step.items) {
      return false
    }

    firstIncompleteStepItemIndex = step.items.findIndex(
      (item) => item.status == 'incomplete'
    )
    if (firstIncompleteStepItemIndex >= 0) {
      firstIncompleteStepIndex = i
      return true
    }
  })

  return (
    <div className="mb-10">
      {validSteps.map(({ action, description, error }, index) => (
        <div className="mb-5 flex gap-3" key={action + index}>
          <div className="h-10 w-10">
            {error ? (
              <HiXCircle className="mx-auto -mt-1 h-10 w-10 flex-none text-red-600" />
            ) : firstIncompleteStepIndex > index ||
              firstIncompleteStepItemIndex === -1 ? (
              <HiCheckCircle className="mx-auto -mt-1 h-10 w-10 flex-none text-green-600" />
            ) : firstIncompleteStepIndex === index ? (
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
            {firstIncompleteStepIndex === index && (
              <>
                <div className="reservoir-body mb-2.5 dark:text-white">
                  {description}
                </div>
                {firstIncompleteStep?.items &&
                  firstIncompleteStep.items.length > 1 && (
                    <div className="reservoir-body italic dark:text-white">
                      {firstIncompleteStepItemIndex + 1} /{' '}
                      {firstIncompleteStep.items.length}
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
