import { toggleOffItem, toggleOnItem } from 'lib/router'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { FC } from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { FiChevronDown } from 'react-icons/fi'

type Props = {
  setSize: any
}

const SortMenu: FC<Props> = ({ setSize }) => {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [sortSelection, setSortSelection] = useState<
    'Lowest Price' | 'Highest Offer' | 'Token ID' | null
  >(null)

  useEffect(() => {
    if (router.isReady) {
      if (!!router.query['sort']) {
        if (router.query['sort'] === 'highest_offer') {
          setSortSelection('Highest Offer')
        }
        if (router.query['sort'] === 'token_id') {
          setSortSelection('Token ID')
        }
      } else {
        setSortSelection('Lowest Price')
      }
    }
  }, [router.query])

  return (
    <DropdownMenu.Root onOpenChange={setOpen}>
      <DropdownMenu.Trigger className="btn-primary-outline w-[228px] justify-between px-4 py-3">
        <span className="reservoir-label-l">Sort By</span>
        <FiChevronDown
          className={`h-5 w-5 text-[#9CA3AF] transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </DropdownMenu.Trigger>

      <DropdownMenu.Content
        align="end"
        sideOffset={12}
        className="w-48 divide-y-[1px] divide-[#D1D5DB] overflow-hidden rounded-[8px] border-[1px] border-[#D1D5DB] bg-white shadow-md  radix-side-bottom:animate-slide-down md:w-56"
      >
        {[
          { display: 'Lowest Price', value: 'lowest_price' },
          { display: 'Highest Offer', value: 'highest_offer' },
          { display: 'Token ID', value: 'token_id' },
        ].map(({ display, value }) => (
          <DropdownMenu.Item
            key={value}
            onClick={() => {
              setSize(0)
              if (value === 'lowest_price') {
                toggleOffItem(router, 'sort')
              } else {
                toggleOnItem(router, 'sort', value)
              }
            }}
            disabled={sortSelection === display}
            className={`reservoir-gray-dropdown-item reservoir-h6 rounded-none ${
              sortSelection === display ? 'cursor-not-allowed bg-gray-100' : ''
            }`}
            aria-label={`Sort by ${display}`}
          >
            {display}
          </DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}

export default SortMenu
