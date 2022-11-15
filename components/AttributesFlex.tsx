import { toggleOffAttribute } from 'lib/url'
import { useRouter } from 'next/router'
import React, { FC } from 'react'
import { HiX } from 'react-icons/hi'

type Attribute = {
  key: string
  value: string
}[]

type Props = {
  className: string
}

const AttributesFlex: FC<Props> = ({ className }) => {
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

  if (filters.length === 0) return null

  return (
    <div className={className}>
      {filters.map(({ key, value }) => (
        <div
          key={key}
          className="hidden rounded-full border border-neutral-300 bg-primary-100 px-4 py-3 dark:border-neutral-600 dark:bg-primary-900 dark:text-white md:flex"
        >
          <div className="reservoir-label-l flex items-center justify-between gap-1.5 dark:text-white ">
            <p className="capitalize">{key}</p>
            <p>{value}</p>
          </div>
          <button
            className="ml-4"
            onClick={() => toggleOffAttribute(router, key)}
          >
            <HiX className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  )
}

export default AttributesFlex
