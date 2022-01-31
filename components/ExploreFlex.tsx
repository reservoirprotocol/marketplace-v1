import { toggleOffItem } from 'lib/router'
import { useRouter } from 'next/router'
import React from 'react'
import { HiX } from 'react-icons/hi'

const ExploreFlex = () => {
  const router = useRouter()

  if (router.query?.attribute_key || router.query?.attribute_key === '') {
    return (
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex border rounded-md border-neutral-300 dark:border-neutral-700">
          <div className="px-4 py-1 lg:py-2 flex items-center justify-between gap-1.5">
            <p className="capitalize">Explore</p>
            <p className="font-semibold">{`${
              router.query?.attribute_key === ''
                ? 'All'
                : router.query?.attribute_key
            }`}</p>
          </div>
          <button
            className="absolute -top-2.5 -right-2.5 p-1 rounded-full text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition bg-neutral-200 dark:bg-neutral-700 dark:hover:bg-red-700 hover:bg-red-200"
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
