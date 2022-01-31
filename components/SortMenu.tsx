import { toggleOffItem, toggleOnItem } from 'lib/router'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import * as ToggleGroup from '@radix-ui/react-toggle-group'

const SortMenu = ({ setSize }: { setSize: any }) => {
  const router = useRouter()
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
    <ToggleGroup.Root
      type="single"
      defaultValue="lowest_price"
      aria-label="Filter tokens"
      className="rounded-md overflow-hidden shadow-inner"
    >
      {[
        { display: 'Lowest Price', value: 'lowest_price' },
        { display: 'Highest Offer', value: 'highest_offer' },
        { display: 'Token ID', value: 'token_id' },
      ].map(({ display, value }) => (
        <ToggleGroup.Item
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
          className={`px-3 py-2 select-none transition ${
            sortSelection === display
              ? 'bg-neutral-200 dark:bg-neutral-700 cursor-not-allowed'
              : 'hover:bg-neutral-200 dark:hover:bg-neutral-800'
          }`}
          aria-label={`Sort by ${display}`}
          value={value}
        >
          {display}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  )
}

export default SortMenu
