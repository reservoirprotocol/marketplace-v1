import * as Accordion from '@radix-ui/react-accordion'
import { FC } from 'react'
import AttributeSelector from './filter/AttributeSelector'
import { FiChevronDown } from 'react-icons/fi'
import { useAttributes } from '@reservoir0x/reservoir-kit-ui'
import { styled } from '@stitches/react'

const StyledChevron = styled(FiChevronDown, {
  transition: 'transform',
  '[data-state=open] &': { transform: 'rotate(180deg)' },
});

type Props = {
  attributes: ReturnType<typeof useAttributes>['data']
  refreshData: () => void
}

const Sidebar: FC<Props> = ({ attributes, refreshData }) => {
  return (
    <Accordion.Root
      type="multiple"
      className="min-w-[300px] w-min md:w-1/3 max-w-sm mr-4 hidden border-r-[1px] border-gray-300 dark:border-neutral-600 md:block "
    >
      <div className="text-lg font-semibold border-b-[1px] border-gray-300 px-6 py-5 text-left transition dark:border-neutral-600 dark:text-white">
        Filters
      </div>
      {attributes?.map((attribute) => (
        <Accordion.Item
          value={`item-${attribute.key}`}
          key={attribute.key}
          className="overflow-hidden"
        >
          <Accordion.Header
            className='flex w-full justify-between border-b-[1px] border-gray-300 dark:border-neutral-600'
          >
            <Accordion.Trigger className="flex items-center justify-between w-full p-5 transition hover:bg-primary-100 dark:hover:bg-primary-900">
              {attribute.key}
              <StyledChevron className="h-5 w-5" aria-hidden />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content>
            <AttributeSelector
              attribute={attribute}
              refreshData={refreshData}
            />
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  )
}

export default Sidebar
