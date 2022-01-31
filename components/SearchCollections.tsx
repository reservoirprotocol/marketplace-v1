import React, { FC, useRef, useState } from 'react'
import Link from 'next/link'
import Downshift from 'downshift'
import { useRouter } from 'next/router'
import { paths } from 'interfaces/apiTypes'
import { RiLoader2Fill } from 'react-icons/ri'
import setParams from 'lib/params'

type Props = {
  apiBase: string
}

const SearchCollection: FC<Props> = ({ apiBase }) => {
  const router = useRouter()
  const [focused, setFocused] = useState<boolean>(false)
  const [results, setResults] = useState<
    paths['/collections']['get']['responses']['200']['schema']['collections']
  >([])
  const [loading, setLoading] = useState<boolean>(false)

  const [count, setCount] = useState(0)
  const countRef = useRef(count)
  countRef.current = count

  return (
    <Downshift
      onInputValueChange={(value) => {
        setLoading(true)
        if (value !== '') {
          setTimeout(async () => {
            setCount(countRef.current)
            try {
              const url = new URL('/collections', apiBase)

              const query: paths['/collections']['get']['parameters']['query'] =
                {
                  sortBy: 'floorCap',
                  sortDirection: 'desc',
                  name: value,
                }

              setParams(url, query)

              const res = await fetch(url.href)

              const data =
                (await res.json()) as paths['/collections']['get']['responses']['200']['schema']

              data.collections && setResults(data.collections)
            } catch (error) {
              console.error(error)
            }
            setLoading(false)
          }, 600)
        } else {
          setResults([])
          setLoading(false)
        }
      }}
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
            className="w-full bg-transparent px-2 placeholder-neutral-600 focus:outline-none dark:placeholder-neutral-500"
            placeholder="Search for an NFT collection"
            {...getInputProps()}
          />

          {(focused || isOpen) && inputValue !== '' && (
            <div
              className="absolute top-12 z-10 w-full overflow-hidden rounded-md border border-neutral-300 bg-white shadow-md dark:border-neutral-700 dark:bg-[#121212]"
              {...getMenuProps()}
            >
              {loading && (
                <div className="absolute right-0 z-20 p-1.5">
                  <RiLoader2Fill className="animate-spin-slow h-6 w-6" />
                </div>
              )}
              {inputValue === '' ? (
                results?.slice(0, 6).map((collection, index) => (
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
                        className="h-[40px] w-[40px] overflow-hidden rounded-md"
                      />
                      <span>{collection?.collection?.name}</span>
                    </a>
                  </Link>
                ))
              ) : results && results.length > 0 ? (
                results?.slice(0, 6).map((item, index) => (
                  <Link
                    key={item?.collection?.name}
                    href={`/collections/${item?.collection?.id}`}
                  >
                    <a
                      {...getItemProps({
                        key: item?.collection?.name,
                        index,
                        item,
                      })}
                      className={`flex items-center gap-4 p-2 hover:bg-neutral-200 dark:hover:bg-neutral-800 md:p-3.5 ${
                        highlightedIndex === index
                          ? 'bg-neutral-200 dark:bg-neutral-800'
                          : ''
                      }`}
                    >
                      <img
                        src={
                          item?.collection?.image
                            ? item.collection.image
                            : 'https://via.placeholder.com/30'
                        }
                        alt={`${item?.collection?.name}'s logo.`}
                        className="h-[40px] w-[40px] overflow-hidden rounded-md"
                      />
                      <span>{item?.collection?.name}</span>
                    </a>
                  </Link>
                ))
              ) : results?.length === 0 && !loading ? (
                <div className="flex items-center gap-4 p-2 hover:bg-neutral-200 dark:hover:bg-neutral-800 md:p-3.5">
                  No collections found
                </div>
              ) : (
                <div className="flex items-center gap-4 p-2 md:p-3.5">
                  Loading
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Downshift>
  )
}

export default SearchCollection
