import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { FC } from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { FiChevronDown } from 'react-icons/fi'

type Options =
  | 'Price low to high'
  | 'Price high to low'
  | 'Rare to Common'
  | 'Common to Rare'

const options: { [x: string]: { sortBy: string; sortDirection: string } } = {
  'Price low to high': { sortBy: 'floorAskPrice', sortDirection: 'asc' },
  'Price high to low': { sortBy: 'floorAskPrice', sortDirection: 'desc' },
  'Rare to Common': { sortBy: 'rarity', sortDirection: 'desc' },
  'Common to Rare': { sortBy: 'rarity', sortDirection: 'asc' },
}

const SortTokens: FC = ({}) => {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [sortSelection, setSortSelection] =
    useState<Options>('Price low to high')

  useEffect(() => {
    const sortBy = router?.query['sortBy']?.toString()
    const sortDirection = router?.query['sortDirection']?.toString()

    if (sortBy === 'rarity' && sortDirection === 'asc') {
      setSortSelection('Common to Rare')
      return
    }
    if (sortBy === 'rarity' && sortDirection === 'desc') {
      setSortSelection('Rare to Common')
      return
    }
    if (sortBy === 'floorAskPrice' && sortDirection === 'desc') {
      setSortSelection('Price high to low')
      return
    }
    setSortSelection('Price low to high')
  }, [router.query])

  return (
    <DropdownMenu.Root onOpenChange={setOpen}>
      <DropdownMenu.Trigger className="btn-primary-outline hidden w-[200px] justify-between px-4 py-3 dark:border-neutral-600 dark:ring-primary-900 dark:focus:ring-4 xl:flex">
        <span className="reservoir-label-l dark:text-gray-100">
          {sortSelection}
        </span>
        <FiChevronDown
          className={`h-5 w-5 text-[#9CA3AF] transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </DropdownMenu.Trigger>

      <DropdownMenu.Content
        align="end"
        sideOffset={12}
        className="z-20 w-[200px] divide-y-[1px] divide-[#D1D5DB] overflow-hidden rounded-[8px] border-[1px] border-[#D1D5DB] bg-white shadow-md radix-side-bottom:animate-slide-down dark:divide-neutral-600 dark:border-neutral-600 dark:bg-neutral-800"
      >
        {Object.keys(options).map((key) => (
          <DropdownMenu.Item
            key={key}
            onClick={() => {
              router.push(
                {
                  query: {
                    ...router.query,
                    ['sortBy']: options[key].sortBy,
                    ['sortDirection']: options[key].sortDirection,
                  },
                },
                undefined,
                {
                  shallow: true,
                }
              )
            }}
            className={`reservoir-label-l reservoir-gray-dropdown-item rounded-none hover:bg-neutral-100 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800`}
            aria-label={`Sort by ${key}`}
          >
            {key}
          </DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}

export default SortTokens
