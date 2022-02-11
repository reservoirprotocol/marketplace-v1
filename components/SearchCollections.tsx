import React, { FC, useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Downshift from 'downshift'
import { useRouter } from 'next/router'
import { paths } from 'interfaces/apiTypes'
import { RiLoader2Fill } from 'react-icons/ri'
import setParams from 'lib/params'
import debounce from 'lodash.debounce'

type Props = {
  communityId?: string
}

const apiBase = process.env.NEXT_PUBLIC_API_BASE

const SearchCollections: FC<Props> = ({ communityId }) => {
  const router = useRouter()
  const [focused, setFocused] = useState<boolean>(false)
  const [results, setResults] = useState<
    paths['/collections']['get']['responses']['200']['schema']
  >({})
  const [loading, setLoading] = useState<boolean>(false)

  // LOAD INITIAL RESULTS
  useEffect(() => {
    if (!apiBase) return

    const url = new URL('/collections', apiBase)

    const query: paths['/collections']['get']['parameters']['query'] = {
      sortBy: 'floorCap',
      sortDirection: 'desc',
    }

    if (communityId && communityId !== 'www') query['community'] = communityId

    setParams(url, query)

    async function initialData(url: URL) {
      const res = await fetch(url.href)

      const json =
        (await res.json()) as paths['/collections']['get']['responses']['200']['schema']

      setResults({ collections: json.collections })
    }

    initialData(url)
  }, [apiBase, communityId])

  const [count, setCount] = useState(0)
  const countRef = useRef(count)
  countRef.current = count

  const debouncedSearch = useCallback(
    debounce(async (value) => {
      if (value === '') return

      // Fetch new results
      setCount(countRef.current)

      setLoading(true)
      try {
        if (communityId && communityId !== 'www')
          setParams(url, { ...query, community: communityId })

        setParams(url, { ...query, name: value })

        const res = await fetch(url.href)

        const data =
          (await res.json()) as paths['/collections']['get']['responses']['200']['schema']

        if (!data) throw new ReferenceError('Data does not exist.')

        setResults({ collections: data.collections })
      } catch (err) {
        console.error(err)
      }

      setLoading(false)
    }, 700),
    []
  )

  const url = new URL('/collections', apiBase)

  const query: paths['/collections']['get']['parameters']['query'] = {
    sortBy: 'floorCap',
    sortDirection: 'desc',
  }

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
      }) => (
        <div
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`relative mr-auto inline-flex w-[300px] rounded-md border py-2 transition hover:border-neutral-300 hover:shadow-md dark:hover:border-neutral-700 md:w-[400px] ${
            focused
              ? 'border-neutral-300 shadow-md dark:border-neutral-700'
              : 'border-neutral-200 dark:border-neutral-800'
          }`}
        >
          <input
            type="search"
            className="w-full bg-transparent px-4 py-1 placeholder-neutral-600 focus:outline-none dark:placeholder-neutral-500"
            placeholder="Search for an NFT collection"
            {...getInputProps()}
          />

          {(focused || isOpen) && (
            <div
              className="absolute top-14 z-10 w-full overflow-hidden rounded-md border border-neutral-200 bg-white shadow-lg"
              {...getMenuProps()}
            >
              {loading && (
                <div className="absolute right-0 z-20 p-1.5">
                  <RiLoader2Fill className="h-6 w-6 animate-spin" />
                </div>
              )}
              {results?.collections?.length !== 0 ? (
                results?.collections?.slice(0, 6).map((collection, index) => (
                  <Link
                    key={collection?.collection?.name}
                    href={`/collections/${collection?.collection?.id}`}
                  >
                    <a
                      {...getItemProps({
                        key: collection?.collection?.name,
                        index,
                        item: collection,
                      })}
                      className={`flex items-center gap-4 p-2 hover:bg-neutral-200 dark:hover:bg-neutral-800 md:p-3.5 ${
                        highlightedIndex === index
                          ? 'bg-neutral-200 dark:bg-neutral-800'
                          : ''
                      }`}
                    >
                      <img
                        src={
                          collection?.collection?.image ??
                          'https://via.placeholder.com/30'
                        }
                        alt={`${collection?.collection?.name}'s logo.`}
                        className="h-[40px] w-[40px] overflow-hidden rounded-full"
                      />
                      <span>{collection?.collection?.name}</span>
                    </a>
                  </Link>
                ))
              ) : (
                <div className="flex items-center gap-4 p-2 hover:bg-neutral-200 dark:hover:bg-neutral-800 md:p-3.5">
                  No collections found
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Downshift>
  )
}

export default SearchCollections
