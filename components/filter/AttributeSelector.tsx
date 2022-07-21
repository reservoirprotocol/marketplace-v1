import React, { FC, useEffect, useState } from 'react'
import AttributeButton from 'components/AttributeButton'
import { DebounceInput } from 'react-debounce-input'
import { matchSorter } from 'match-sorter'
import { sortAttributes } from './functions'
import { SWRInfiniteResponse } from 'swr/infinite/dist/infinite'
import { FiSearch, FiXCircle } from 'react-icons/fi'
import { paths } from '@reservoir0x/reservoir-kit-client'

type Props = {
  attribute: NonNullable<
    paths['/collections/{collection}/attributes/all/v1']['get']['responses']['200']['schema']['attributes']
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
    <div className="border-b-[1px] border-gray-300 dark:border-neutral-600">
      <div className="relative m-4">
        <FiSearch
          className={`absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#4b5563] ${
            query !== '' ? 'text-[#9CA3AF]' : ''
          }`}
        />
        <DebounceInput
          className="reservoir-label-l input-primary-outline w-full pl-9 dark:border-neutral-600 dark:bg-neutral-900 dark:text-white dark:ring-primary-900 dark:focus:ring-4"
          type="text"
          autoFocus
          value={query}
          autoComplete="off"
          placeholder="Search"
          debounceTimeout={300}
          onChange={(e) => setQuery(e.target.value)}
        />
        {typeof query === 'string' && query !== '' && (
          <button onClick={() => setQuery('')}>
            <FiXCircle className="absolute top-1/2 right-3 z-20 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
          </button>
        )}
      </div>
      <div className="mb-3 max-h-[155px] overflow-y-auto">
        {searchedValues.map(({ value, count }, index) => {
          if (!value) return null
          return (
            <AttributeButton
              value={value}
              attribute={key}
              key={`${value}${index}`}
              setTokensSize={setTokensSize}
            >
              <span className="reservoir-body dark:text-white">{value}</span>
              <span className="reservoir-body dark:text-white">{count}</span>
            </AttributeButton>
          )
        })}
      </div>
    </div>
  )
}

export default AttributeSelector
