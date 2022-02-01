import { NextRouter } from 'next/router'
import { useState, useEffect } from 'react'

export default function useFiltersApplied(router: NextRouter) {
  const [filtersApplied, setFiltersApplied] = useState(false)

  // Check if there are filters applied
  useEffect(() => {
    if (router.isReady) {
      let filtersApplied = Object.keys(router.query).find(
        (key) =>
          key.startsWith('attributes[') &&
          key.endsWith(']') &&
          router.query[key] !== ''
      )

      filtersApplied !== undefined
        ? setFiltersApplied(true)
        : setFiltersApplied(false)
    }
  }, [router.isReady, router.query])

  return filtersApplied
}
