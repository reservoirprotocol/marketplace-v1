import React, { FC, useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Downshift from 'downshift'
import { useRouter } from 'next/router'
import setParams from 'lib/params'
import debounce from 'lodash.debounce'
import { FiSearch, FiXCircle } from 'react-icons/fi'
import { paths } from '@reservoir0x/client-sdk'

type Props = {
  communityId?: string
}

const PROXY_API_BASE = process.env.NEXT_PUBLIC_PROXY_API_BASE

const SearchCollections: FC<Props> = ({ communityId }) => {
  const router = useRouter()
  const [focused, setFocused] = useState<boolean>(false)
  const [results, setResults] = useState<
    paths['/collections/v2']['get']['responses']['200']['schema']
  >({})
  const [initialResults, setInitialResults] = useState<
    paths['/collections/v2']['get']['responses']['200']['schema'] | undefined
  >(undefined)

  function getHref(search?: string) {
    const pathname = `${PROXY_API_BASE}/collections/v2`

    const query: paths['/collections/v2']['get']['parameters']['query'] = {
      sortBy: '7DayVolume',
    }

    if (communityId && communityId !== 'www' && communityId !== 'localhost') {
      query.community = communityId
    }

    if (search) query.name = search

    const href = setParams(pathname, query)

    return href
  }

  async function loadInitialResults(href: string) {
    const res = await fetch(href)

    const json =
      (await res.json()) as paths['/collections/v2']['get']['responses']['200']['schema']

    setResults(json)
    setInitialResults(json)
  }

  // LOAD INITIAL RESULTS
  useEffect(() => {
    if (focused && !initialResults) {
      const href = getHref()
      loadInitialResults(href)
    }
  }, [focused])

  const [count, setCount] = useState(0)
  const countRef = useRef(count)
  countRef.current = count

  const debouncedSearch = useCallback(
    debounce(async (value) => {
      // Do not search empty string
      if (value === '') {
        setResults({})
        return
      }

      // Fetch new results
      setCount(countRef.current)

      const href = getHref(value)

      try {
        const res = await fetch(href)

        const data =
          (await res.json()) as paths['/collections/v2']['get']['responses']['200']['schema']

        if (!data) throw new ReferenceError('Data does not exist.')

        setResults(data)
      } catch (err) {
        console.error(err)
      }
    }, 700),
    []
  )

  const isEmpty = results?.collections?.length === 0

  return (
    <Downshift
      onInputValueChange={(value) => debouncedSearch(value)}
      id="search-bar-downshift"
      onChange={(item) => item.id && router.push(`/collections/${item.id}`)}
      itemToString={(item) => (item ? item.name : '')}
    >
      {({
        getInputProps,
        getItemProps,
        getMenuProps,
        isOpen,
        highlightedIndex,
        inputValue,
        reset,
      }) => (
        <div
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="relative"
        >
          <FiSearch
            className={`absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#4b5563] dark:text-neutral-300 ${
              focused ? 'text-[#9CA3AF]' : ''
            }`}
          />
          <input
            type="text"
            tabIndex={-1}
            className="reservoir-label-l input-primary-outline w-full pl-9 dark:border-neutral-600 dark:bg-neutral-600 dark:text-white dark:placeholder:text-neutral-400 lg:w-[447px]"
            placeholder="Search for a collection"
            {...getInputProps()}
          />
          {typeof inputValue === 'string' && inputValue !== '' && (
            <button
              onClick={() => {
                reset()
                setFocused(false)
              }}
            >
              <FiXCircle className="absolute top-1/2 right-3 z-20 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
            </button>
          )}

          {(focused || isOpen) &&
            inputValue === '' &&
            initialResults?.collections &&
            initialResults?.collections.length > 0 && (
              <div
                className="absolute top-[50px] z-10 w-full divide-y-[1px] divide-[#D1D5DB] overflow-hidden rounded-[8px] border border-[#D1D5DB] bg-white dark:divide-neutral-600 dark:border-neutral-600 dark:bg-neutral-900"
                {...getMenuProps()}
              >
                {initialResults?.collections
                  ?.filter((collection) => {
                    if (collection.tokenCount) {
                      return +collection.tokenCount <= 30000
                    }
                    return false
                  })
                  .slice(0, 6)
                  .map((collection, index) => (
                    <Link
                      key={collection?.name}
                      href={`/collections/${collection?.id}`}
                    >
                      <a
                        {...getItemProps({
                          key: collection?.name,
                          index,
                          item: collection,
                        })}
                        onClick={() => {
                          reset()
                          setFocused(false)
                        }}
                        className={`flex items-center p-4 hover:bg-[#F3F4F6] dark:hover:bg-neutral-600 ${
                          highlightedIndex === index
                            ? 'bg-[#F3F4F6] dark:bg-neutral-600'
                            : ''
                        }`}
                      >
                        <img
                          src={
                            // @ts-ignore
                            collection?.image ??
                            'https://via.placeholder.com/30'
                          }
                          alt={`${collection?.name}'s logo.`}
                          className="h-9 w-9 overflow-hidden rounded-full"
                        />
                        <span className="reservoir-subtitle ml-2 dark:text-white">
                          {collection?.name}
                        </span>
                      </a>
                    </Link>
                  ))}
              </div>
            )}
          {(focused || isOpen) && inputValue !== '' && isEmpty && (
            <div
              className="absolute top-[50px] z-10 w-full divide-y-[1px] divide-[#D1D5DB] overflow-hidden rounded-[8px] border border-[#D1D5DB] bg-white dark:divide-neutral-600 dark:border-neutral-600 dark:bg-neutral-900"
              {...getMenuProps()}
            >
              <div className="flex items-center p-4">No collections found</div>
            </div>
          )}
          {(focused || isOpen) && inputValue !== '' && !isEmpty && (
            <div
              className="absolute top-[50px] z-10 w-full divide-y-[1px] divide-[#D1D5DB] overflow-hidden rounded-[8px] border border-[#D1D5DB] bg-white dark:divide-neutral-600 dark:border-neutral-600 dark:bg-neutral-900"
              {...getMenuProps()}
            >
              {results?.collections
                ?.filter((collection) => {
                  if (collection.tokenCount) {
                    return +collection.tokenCount <= 30000
                  }
                  return false
                })
                .slice(0, 6)
                .map((collection, index) => (
                  <Link
                    key={collection?.name}
                    href={`/collections/${collection?.id}`}
                  >
                    <a
                      {...getItemProps({
                        key: collection?.name,
                        index,
                        item: collection,
                      })}
                      onClick={() => {
                        reset()
                        setFocused(false)
                      }}
                      className={`flex items-center p-4 hover:bg-[#F3F4F6] dark:hover:bg-neutral-600 ${
                        highlightedIndex === index
                          ? 'bg-[#F3F4F6] dark:bg-neutral-600'
                          : ''
                      }`}
                    >
                      <img
                        src={
                          // @ts-ignore
                          collection?.image ?? 'https://via.placeholder.com/30'
                        }
                        alt={`${collection?.name}'s logo.`}
                        className="h-9 w-9 overflow-hidden rounded-full"
                      />
                      <span className="reservoir-subtitle ml-2 dark:text-white">
                        {collection?.name}
                      </span>
                    </a>
                  </Link>
                ))}
            </div>
          )}
        </div>
      )}
    </Downshift>
  )
}

export default SearchCollections
