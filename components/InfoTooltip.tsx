import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons'
import Popover from './Popover'
type Props = {
  side: string
  content: string
  width: number
}

const InfoTooltip = ({ side, content, width }: Props) => {
  return (
    <Popover
      side={side}
      width={width}
      content={
        <div className="align-center text-center text-sm font-light text-white">
          {content}
        </div>
      }
    >
      <div className="text-neutral-400">
        <FontAwesomeIcon icon={faInfoCircle} />
      </div>
    </Popover>
  )
}

export default InfoTooltip
