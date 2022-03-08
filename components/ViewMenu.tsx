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
      className="divide-x-[1px] divide-[#D1D5DB] overflow-hidden rounded-[8px] border-[1px] border-[#D1D5DB]"
    >
      <ToggleGroup.Item
        onClick={() => toggleOffItem(router, 'view')}
        value="grid"
        disabled={!!router.query?.view && !router.query?.view}
        className={`select-none px-3 py-2 transition ${
          !router.query?.view
            ? 'cursor-not-allowed bg-[#F1E5FF]'
            : 'hover:bg-[#F1E5FF]'
        }`}
        aria-label="Set view to grid"
      >
        <div className="p-2">
          <FiGrid className="h-6 w-6 text-[#4B5563]" />
        </div>
      </ToggleGroup.Item>
      <ToggleGroup.Item
        onClick={() => toggleOnItem(router, 'view', 'table')}
        value="table"
        disabled={
          !!router.query?.view && router.query?.view.toString() === 'table'
        }
        className={`select-none px-3 py-2 transition ${
          router.query?.view && router.query?.view.toString() === 'table'
            ? 'cursor-not-allowed bg-[#F1E5FF]'
            : 'hover:bg-[#F1E5FF]'
        }`}
        aria-label="Set view to table"
      >
        <div className="p-2">
          <FiList className="h-6 w-6 text-[#4B5563]" />
        </div>
      </ToggleGroup.Item>
    </ToggleGroup.Root>
  )
}

export default ViewMenu
