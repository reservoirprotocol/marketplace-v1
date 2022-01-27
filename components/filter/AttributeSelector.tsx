import React, { FC, useEffect, useState } from 'react'
import AttributeButton from 'components/AttributeButton'
import { DebounceInput } from 'react-debounce-input'
import { matchSorter } from 'match-sorter'
import { sortAttributes } from './functions'
import { paths } from 'interfaces/apiTypes'
import { SWRInfiniteResponse } from 'swr/infinite/dist/infinite'

type Props = {
  attribute: NonNullable<
    paths['/attributes']['get']['responses']['200']['schema']['attributes']
  >[number]
  setTokensSize: SWRInfiniteResponse['setSize']
}

const AttributeSelector: FC<Props> = ({
  attribute: { key, values },
  setTokensSize,
}) => {
  const [searchedValues, setsearchedValues] = useState(values || [])
  const [query, setQuery] = useState('')

  useEffect(() => {
    let results = matchSorter(values || [], query, {
      keys: ['value'],
    })
    sortAttributes(results)
    setsearchedValues(results)
  }, [query, values])

  if (!key) {
    console.error(new ReferenceError('key is undefined'))
    return null
  }

  return (
    <div className="bg-white p-2 dark:bg-black lg:p-3">
      <DebounceInput
        className={`mt-1 mb-1.5 w-full rounded-md bg-transparent px-1.5 py-1 font-medium placeholder-neutral-500 ring-1 ring-neutral-300 hover:ring-neutral-500 focus:bg-neutral-50 focus:shadow focus:outline-none focus:ring-neutral-400 dark:placeholder-neutral-400 dark:ring-neutral-700 dark:focus:bg-neutral-900 dark:focus:ring-neutral-500`}
        type="search"
        autoFocus
        autoComplete="off"
        placeholder="Search"
        debounceTimeout={300}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="mb-1.5 max-h-[155px] overflow-y-auto">
        {searchedValues.map(({ value, count }, index) => {
          if (!value) return null
          return (
            <AttributeButton
              value={value}
              attribute={key}
              key={`${value}${index}`}
              setTokensSize={setTokensSize}
            >
              <span>{value}</span>
              <span>{count}</span>
            </AttributeButton>
          )
        })}
      </div>
    </div>
  )
}

export default AttributeSelector
