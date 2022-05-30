import { toggleOffItem, toggleOnItem } from 'lib/router'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { FC } from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { FiChevronDown } from 'react-icons/fi'

type Props = { setSize: any }

type Options = 'High Floor' | 'Best Offer' | 'Name'

const options: { [x: string]: Options } = {
  high_floor: 'High Floor',
  best_offer: 'Best Offer',
  name: 'Name',
}

const SortMenuExplore: FC<Props> = ({ setSize }) => {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [sortSelection, setSortSelection] = useState<Options>('High Floor')

  useEffect(() => {
    const sort = router?.query['sort']?.toString()
    if (sort && options[sort]) {
      setSortSelection(options[sort])
      return
    }
    setSortSelection('High Floor')
  }, [router.query])

  return (
    <DropdownMenu.Root onOpenChange={setOpen}>
      <DropdownMenu.Trigger className="btn-primary-outline w-[228px] justify-between px-4 py-3 dark:border-neutral-600 dark:ring-primary-900 dark:focus:ring-4">
        <span className="reservoir-label-l dark:text-white">
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
        className="w-48 divide-y-[1px] divide-[#D1D5DB] overflow-hidden rounded-[8px] border-[1px] border-[#D1D5DB] bg-white shadow-md radix-side-bottom:animate-slide-down dark:divide-neutral-600 dark:border-neutral-600 dark:bg-neutral-900 md:w-56"
      >
        {Object.keys(options).map((key) => (
          <DropdownMenu.Item
            key={key}
            onClick={() => {
              setSize(0)
              if (key === 'high_floor') {
                toggleOffItem(router, 'sort')
              } else {
                toggleOnItem(router, 'sort', key)
              }
            }}
            disabled={sortSelection === options[key]}
            className={`reservoir-label-l reservoir-gray-dropdown-item rounded-none dark:text-white dark:hover:bg-neutral-800 dark:focus:bg-neutral-800`}
            aria-label={`Sort by ${options[key]}`}
          >
            {options[key]}
          </DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}

export default SortMenuExplore
