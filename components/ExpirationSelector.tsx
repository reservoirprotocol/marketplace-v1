import React, { FC } from 'react'
import * as ToggleGroup from '@radix-ui/react-toggle-group'

type Props = {
  presets: {
    preset: string
    value: () => string
    display: string
  }[]
  expiration: string
  setExpiration: React.Dispatch<React.SetStateAction<string>>
}

const ExpirationSelector: FC<Props> = ({
  presets,
  expiration,
  setExpiration,
}) => {
  return (
    <ToggleGroup.Root
      type="single"
      value={expiration}
      onValueChange={(value) => value && setExpiration(value)}
      className="overflow-hidden p-1 flex justify-between"
    >
      {presets.map(({ preset, display }) => (
        <ToggleGroup.Item
          key={preset}
          value={preset}
          className="btn-blue-ghost whitespace-nowrap px-3
          radix-state-on:bg-blue-900 radix-state-on:text-white radix-state-on:hover:bg-blue-800 radix-state-on:hover:text-white"
        >
          {display}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  )
}

export default ExpirationSelector
