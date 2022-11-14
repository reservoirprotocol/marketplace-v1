import * as Dialog from '@radix-ui/react-dialog'
import {
  useCollectionActivity,
  useUsersActivity,
} from '@reservoir0x/reservoir-kit-ui'
import { FC, useState } from 'react'
import * as Checkbox from '@radix-ui/react-checkbox'
import { FaCheck } from 'react-icons/fa'

type CollectionActivityResponse = ReturnType<typeof useCollectionActivity>
export type CollectionActivityTypes = NonNullable<
  Exclude<Parameters<typeof useCollectionActivity>['0'], boolean>
>['types']

type UsersActivityResponse = ReturnType<typeof useCollectionActivity>
type ActivityResponse = CollectionActivityResponse | UsersActivityResponse
export type UserActivityTypes = NonNullable<
  Exclude<Parameters<typeof useUsersActivity>['1'], boolean>
>['types']

type Props = {
  filters: string[]
  enabledFilters: string[]
  data: ActivityResponse
  onTypesChange: (types: CollectionActivityTypes | UserActivityTypes) => void
  types:
    | (
        | 'sale'
        | 'ask'
        | 'transfer'
        | 'mint'
        | 'bid'
        | 'bid_cancel'
        | 'ask_cancel'
      )[]
    | undefined
}

const MobileActivityFilter: FC<Props> = ({
  filters,
  enabledFilters,
  data,
  onTypesChange,
  types,
}) => {
  const [open, setOpen] = useState(false)

  const clearFilters = () => {
    onTypesChange([])
  }

  let hasEnabledFilters = enabledFilters.length > 0

  return (
    <Dialog.Root onOpenChange={setOpen} open={open} modal={true}>
      <div className="fixed left-0 bottom-6 z-10 flex w-screen flex-col items-center md:hidden">
        {data && (
          <Dialog.Trigger className="btn-primary-outline min-w-[200px] rounded-full bg-white py-3 px-12 text-center shadow-[0px_10px_8px_rgba(0,0,0,0.04)] shadow-[_0px_4px_3px_rgba(0,0,0,0.1)] dark:bg-black">
            <span>Filter</span>
            {hasEnabledFilters && (
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F5F5F5] text-sm dark:bg-[#262626]">
                {enabledFilters.length}
              </span>
            )}
          </Dialog.Trigger>
        )}
      </div>

      <Dialog.Content
        className="fixed inset-0 z-[1100] transform overflow-y-auto overscroll-contain bg-white shadow-md dark:bg-black"
        onInteractOutside={(e) => {
          e.preventDefault()
        }}
      >
        <div className="flex items-center justify-between gap-3 border-b border-neutral-300 px-6 py-4 dark:border-neutral-600">
          <div className="flex items-center">
            <div className="mr-4 flex flex-row items-center">
              <span className="mr-2 text-xl font-semibold">Filters</span>
              {hasEnabledFilters && (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F5F5F5] text-sm dark:bg-[#262626]">
                  {enabledFilters.length}
                </span>
              )}
            </div>
            {hasEnabledFilters && (
              <button
                className="btn-primary-outline border-none py-1.5 px-[5px] text-sm font-light text-[#7000FF] dark:text-[#E2CCFF]"
                onClick={() => clearFilters()}
              >
                Clear all
              </button>
            )}
          </div>
          <Dialog.Close className="btn-primary-outline border-none py-1.5 px-[5px] text-sm font-light text-[#7000FF] dark:text-[#E2CCFF]">
            Done
          </Dialog.Close>
        </div>
        {filters?.map((filter, i) => {
          const isSelected = enabledFilters.includes(filter)
          return (
            <div key={i} className="flex p-4 pl-6">
              <Checkbox.Root
                className={`mr-4 flex h-6 w-6 items-center justify-center rounded border dark:bg-[#262626]
                ${
                  isSelected
                    ? 'border-[1px] border-transparent bg-[#7000FF] dark:bg-[#7000FF]'
                    : 'border-[1px] border-neutral-300 bg-white dark:border-[#525252] dark:bg-black'
                }`}
                defaultChecked
                checked={isSelected}
                id={`checkbox-${i}`}
                disabled={data.isFetchingPage || data.isValidating}
                onCheckedChange={() => {
                  let updatedTypes: Props['types'] = types?.slice() || []
                  let activityType:
                    | 'sale'
                    | 'ask'
                    | 'bid'
                    | 'transfer'
                    | 'mint'
                    | undefined = undefined

                  if (filter === 'Sales') {
                    activityType = 'sale'
                  } else if (filter === 'Listings') {
                    activityType = 'ask'
                  } else if (filter === 'Offers') {
                    activityType = 'bid'
                  } else if (filter === 'Transfer') {
                    activityType = 'transfer'
                  } else if (filter === 'Mints') {
                    activityType = 'mint'
                  }

                  if (!activityType) {
                    return
                  }

                  if (enabledFilters.includes(filter)) {
                    updatedTypes = updatedTypes.filter(
                      (type) => activityType !== type
                    )
                  } else {
                    updatedTypes.push(activityType)
                  }
                  onTypesChange(updatedTypes)
                }}
              >
                <Checkbox.Indicator>
                  <FaCheck className="h-3 w-3 text-white" />
                </Checkbox.Indicator>
              </Checkbox.Root>
              <label htmlFor={`checkbox-${i}`} className="font-light">
                {filter}
              </label>
            </div>
          )
        })}
      </Dialog.Content>
    </Dialog.Root>
  )
}

export default MobileActivityFilter
