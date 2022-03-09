import { toggleOffItem } from 'lib/router'
import { useRouter } from 'next/router'
import React from 'react'
import { HiX } from 'react-icons/hi'

const ExploreFlex = () => {
  const router = useRouter()

  if (router.query?.attribute_key || router.query?.attribute_key === '') {
    return (
      <div className="flex flex-wrap gap-3">
        <div className="relative flex rounded-md border border-neutral-300 dark:border-neutral-700">
          <div className="reservoir-label-l flex items-center justify-between gap-1.5 px-4 py-1 lg:py-2">
            <p className="capitalize">Explore</p>
            <p>{`${
              router.query?.attribute_key === ''
                ? 'All'
                : router.query?.attribute_key
            }`}</p>
          </div>
          <button
            className="absolute -top-2.5 -right-2.5 rounded-full bg-neutral-200 p-1 text-neutral-500 transition hover:bg-red-200 hover:text-neutral-900 dark:bg-neutral-700 dark:text-neutral-400 dark:hover:bg-red-700 dark:hover:text-neutral-100"
            onClick={() => toggleOffItem(router, 'attribute_key')}
          >
            <HiX className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    )
  }
  return null
}

export default ExploreFlex
