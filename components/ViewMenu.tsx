import { toggleOffItem, toggleOnItem } from 'lib/router'
import { useRouter } from 'next/router'
import * as ToggleGroup from '@radix-ui/react-toggle-group'
import { FiGrid, FiList } from 'react-icons/fi'

const ViewMenu = () => {
  const router = useRouter()

  return (
    <ToggleGroup.Root
      type="single"
      defaultValue="grid"
      aria-label="Change view"
      className="flex divide-x-[1px] divide-[#D1D5DB] overflow-hidden rounded-[8px] border-[1px] border-[#D1D5DB] dark:divide-neutral-600 dark:border-neutral-600"
    >
      <ToggleGroup.Item
        onClick={() => toggleOffItem(router, 'view')}
        value="grid"
        disabled={!!router.query?.view && !router.query?.view}
        className={`block select-none p-3 transition  ${
          !router.query?.view
            ? 'cursor-not-allowed bg-[#F1E5FF] dark:bg-primary-900'
            : 'hover:bg-[#F1E5FF] dark:hover:bg-primary-900'
        }`}
        aria-label="Set view to grid"
      >
        <FiGrid className="h-5 w-5 text-[#4B5563] dark:text-white" />
      </ToggleGroup.Item>
      <ToggleGroup.Item
        onClick={() => toggleOnItem(router, 'view', 'table')}
        value="table"
        disabled={
          !!router.query?.view && router.query?.view.toString() === 'table'
        }
        className={`block select-none p-3 transition ${
          router.query?.view && router.query?.view.toString() === 'table'
            ? 'cursor-not-allowed bg-[#F1E5FF] dark:bg-primary-900'
            : 'hover:bg-[#F1E5FF] dark:hover:bg-primary-900'
        }`}
        aria-label="Set view to table"
      >
        <FiList className="h-5 w-5 text-[#4B5563] dark:text-white" />
      </ToggleGroup.Item>
    </ToggleGroup.Root>
  )
}

export default ViewMenu
