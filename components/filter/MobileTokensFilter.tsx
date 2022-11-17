import * as Accordion from '@radix-ui/react-accordion'
import * as Dialog from '@radix-ui/react-dialog'
import { useAttributes } from '@reservoir0x/reservoir-kit-ui'
import { useRouter } from 'next/router'
import { FC, useEffect, useState } from 'react'
import { FiChevronUp } from 'react-icons/fi'
import AttributeSelector from './AttributeSelector'
import { styled } from '@stitches/react'

const StyledChevron = styled(FiChevronUp, {
  transition: 'transform',
  '[data-state=closed] &': {
    transform: 'rotate(180deg)',
  },
})

type Props = {
  attributes: ReturnType<typeof useAttributes>['data'] | undefined
  refreshData: () => void
  scrollToTop: () => void
}

const MobileTokensFilter: FC<Props> = ({
  attributes,
  refreshData,
  scrollToTop,
}) => {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [filtersLength, setFiltersLength] = useState(0)

  useEffect(() => {
    let filters = Object.keys({ ...router.query }).filter(
      (key) =>
        key.startsWith('attributes[') &&
        key.endsWith(']') &&
        router.query[key] !== ''
    )

    setFiltersLength(filters.length)
  }, [router.query])

  let filtersEnabled = filtersLength > 0

  // Clear all attribute filters
  const clearQuery = () => {
    Object.keys(router.query).find((key) => {
      if (
        key.startsWith('attributes[') &&
        key.endsWith(']') &&
        router.query[key] !== ''
      ) {
        delete router.query[key]
      }
    })

    router.push(
      {
        query: { ...router.query },
      },
      undefined,
      {
        shallow: true,
      }
    )
  }

  if (attributes && attributes.length === 0) return null

  return (
    <Dialog.Root onOpenChange={setOpen} open={open} modal={true}>
      <div className="fixed bottom-6 z-10 flex w-screen flex-col items-center md:hidden">
        <Dialog.Trigger className="btn-primary-outline min-w-[200px] rounded-full bg-white py-3 px-12 text-center shadow-[0px_10px_8px_rgba(0,0,0,0.04)] shadow-[_0px_4px_3px_rgba(0,0,0,0.1)] dark:bg-black">
          <span>Filter</span>
          {filtersEnabled && (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F5F5F5] text-sm dark:bg-[#262626]">
              {filtersLength}
            </span>
          )}
        </Dialog.Trigger>
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
              {filtersEnabled && (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F5F5F5] text-sm dark:bg-[#262626]">
                  {filtersLength}
                </span>
              )}
            </div>
            {filtersEnabled && (
              <button
                className="btn-primary-outline border-none py-1.5 px-[5px] text-sm font-light text-[#7000FF] dark:text-[#E2CCFF]"
                onClick={() => clearQuery()}
              >
                Clear all
              </button>
            )}
          </div>
          <Dialog.Close className="btn-primary-outline border-none py-1.5 px-[5px] text-sm font-light text-[#7000FF] dark:text-[#E2CCFF]">
            Done
          </Dialog.Close>
        </div>
        <Accordion.Root
          type="multiple"
          className="overflow-hidden border-r-[1px] border-gray-300 pb-12 dark:border-neutral-600 md:block"
        >
          {attributes?.map((attribute) => (
            <Accordion.Item
              value={`item-${attribute.key}`}
              key={attribute.key}
              className="overflow-hidden"
            >
              <Accordion.Header className="flex w-full items-center justify-between border-b-[1px] border-gray-300 dark:border-neutral-600">
                <Accordion.Trigger className="flex max-h-[64px] w-full items-center justify-between p-5 transition hover:bg-primary-100 dark:hover:bg-primary-900">
                  <div className="flex flex-col items-start">
                    {attribute.key}
                    {router.query[`attributes[${attribute.key}]`] && (
                      <p className="text-xs text-[#525252] dark:text-[#D4D4D4]">
                        {router.query[`attributes[${attribute.key}]`]}
                      </p>
                    )}
                  </div>
                  <StyledChevron className="h-5 w-5" aria-hidden />
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content>
                <AttributeSelector
                  attribute={attribute}
                  refreshData={refreshData}
                  scrollToTop={scrollToTop}
                />
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </Dialog.Content>
    </Dialog.Root>
  )
}

export default MobileTokensFilter
