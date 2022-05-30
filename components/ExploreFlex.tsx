import { toggleOffItem } from 'lib/router'
import { useRouter } from 'next/router'
import React from 'react'
import { HiX } from 'react-icons/hi'

const ExploreFlex = () => {
  const router = useRouter()

  if (router.query?.attribute_key || router.query?.attribute_key === '') {
    return (
      <div className="mb-10 flex flex-wrap gap-3">
        <div className="flex rounded-full border border-neutral-300 bg-primary-100 px-4 py-3 dark:border-neutral-600 dark:bg-primary-900 dark:text-white">
          <div className="reservoir-label-l flex items-center justify-between gap-1.5 dark:text-white">
            <p className="capitalize">Explore</p>
            <p>{`${
              router.query?.attribute_key === ''
                ? 'All'
                : router.query?.attribute_key
            }`}</p>
          </div>
          <button
            className="ml-4"
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
