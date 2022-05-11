import React, { FC } from 'react'

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
    <>
      <label
        htmlFor="expirationSelector"
        className="reservoir-h6 mb-2 font-headings dark:text-white"
      >
        Expiration
      </label>

      <select
        name="expiration"
        id="expirationSelector"
        defaultValue={expiration}
        onChange={(e) => setExpiration(e.target.value)}
        className="input-primary-outline dark:border-neutral-600  dark:bg-neutral-900 dark:ring-primary-900 dark:focus:ring-4"
      >
        {presets.map(({ preset, display }) => (
          <option key={preset} value={preset}>
            {display}
          </option>
        ))}
      </select>
    </>
  )
}

export default ExpirationSelector
