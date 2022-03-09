import { toggleOffAttribute } from 'lib/url'
import { useRouter } from 'next/router'
import React from 'react'
import { HiX } from 'react-icons/hi'

type Attribute = {
  key: string
  value: string
}[]

const AttributesFlex = () => {
  const router = useRouter()

  const [filters, setFilters] = React.useState<Attribute>([])

  React.useEffect(() => {
    let filters = Object.keys({ ...router.query }).filter(
      (key) =>
        key.startsWith('attributes[') &&
        key.endsWith(']') &&
        router.query[key] !== ''
    )

    setFilters(
      // Convert the queries into the tokens format
      filters.map((key) => {
        return {
          key: key.slice(11, -1),
          value: `${router.query[key]}`,
        }
      })
    )
  }, [router.query])

  return (
    <div className="flex flex-wrap gap-3">
      {filters.map(({ key, value }) => {
        return (
          <div
            key={key}
            className="relative flex rounded-md border border-neutral-300 dark:border-neutral-700"
          >
            <div className="reservoir-label-l flex items-center justify-between gap-1.5 px-4 py-1 lg:py-2">
              <p className="capitalize">{key}</p>
              <p>{value}</p>
            </div>
            <button
              className="absolute -top-2.5 -right-2.5 rounded-full bg-neutral-200 p-1 text-neutral-500 transition hover:bg-red-200 hover:text-neutral-900 dark:bg-neutral-700 dark:text-neutral-400 dark:hover:bg-red-700 dark:hover:text-neutral-100"
              onClick={() => toggleOffAttribute(router, key)}
            >
              <HiX className="h-3.5 w-3.5" />
            </button>
          </div>
        )
      })}
    </div>
  )
}

export default AttributesFlex
