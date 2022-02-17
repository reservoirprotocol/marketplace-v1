import { Execute } from 'lib/executeSteps'
import React, { FC } from 'react'

type Props = {
  steps: Execute['steps']
}

const Steps: FC<Props> = ({ steps }) => {
  return (
    <div className="my-4">
      {steps?.map(({ action, description }, index) => (
        <div className="mb-3 flex gap-2" key={action + index}>
          <div className="w-6 text-center text-lg font-semibold">
            {index + 1}
          </div>
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
