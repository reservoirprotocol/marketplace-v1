import { toggleOffItem, toggleOnItem } from 'lib/router'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import * as ToggleGroup from '@radix-ui/react-toggle-group'

const SortMenuExplore = ({ setSize }: { setSize: any }) => {
  const router = useRouter()
  const [sortSelection, setSortSelection] = useState<
    'High Floor' | 'Best Offer' | 'Name' | null
  >(null)

  useEffect(() => {
    if (router.isReady) {
      if (!!router.query['sort']) {
        if (router.query['sort'] === 'best_offer') {
          setSortSelection('Best Offer')
        }
        if (router.query['sort'] === 'name') {
          setSortSelection('Name')
        }
      } else {
        setSortSelection('High Floor')
      }
    }
  }, [router.query])

  return (
    <ToggleGroup.Root
      type="single"
      defaultValue="high_floor"
      aria-label="Filter explore"
      className="overflow-hidden rounded-md shadow-inner"
    >
      {[
        { display: 'High Floor', value: 'high_floor' },
        { display: 'Best Offer', value: 'best_offer' },
        { display: 'Name', value: 'name' },
      ].map(({ display, value }) => (
        <ToggleGroup.Item
          key={value}
          onClick={() => {
            setSize(0)
            if (value === 'high_floor') {
              toggleOffItem(router, 'sort')
            } else {
              toggleOnItem(router, 'sort', value)
            }
          }}
          disabled={sortSelection === display}
          className={`reservoir-label-l select-none px-3 py-2 transition ${
            sortSelection === display
              ? 'cursor-not-allowed bg-neutral-200 dark:bg-neutral-700'
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

export default SortMenuExplore
