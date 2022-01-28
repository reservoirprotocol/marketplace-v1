import { toggleOffItem, toggleOnItem } from 'lib/router'
import { useRouter } from 'next/router'
import * as ToggleGroup from '@radix-ui/react-toggle-group'

const ViewMenu = () => {
  const router = useRouter()

  return (
    <ToggleGroup.Root
      type="single"
      defaultValue="grid"
      aria-label="Change view"
      className="overflow-hidden rounded-md shadow-inner"
    >
      <ToggleGroup.Item
        onClick={() => toggleOffItem(router, 'view')}
        value="grid"
        disabled={!!router.query?.view && !router.query?.view}
        className={`select-none px-3 py-2 transition ${
          !router.query?.view
            ? 'cursor-not-allowed bg-neutral-200 dark:bg-neutral-700'
            : 'hover:bg-neutral-200 dark:hover:bg-neutral-800'
        }`}
        aria-label="Set view to grid"
      >
        Grid
      </ToggleGroup.Item>
      <ToggleGroup.Item
        onClick={() => toggleOnItem(router, 'view', 'table')}
        value="table"
        disabled={
          !!router.query?.view && router.query?.view.toString() === 'table'
        }
        className={`select-none px-3 py-2 transition ${
          router.query?.view && router.query?.view.toString() === 'table'
            ? 'cursor-not-allowed bg-neutral-200 dark:bg-neutral-700'
            : 'hover:bg-neutral-200 dark:hover:bg-neutral-800'
        }`}
        aria-label="Set view to table"
      >
        Table
      </ToggleGroup.Item>
    </ToggleGroup.Root>
  )
}

export default ViewMenu
