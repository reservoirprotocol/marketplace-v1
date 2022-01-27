import * as Accordion from '@radix-ui/react-accordion'
import { HiChevronDown } from 'react-icons/hi'
import { paths } from 'interfaces/apiTypes'
import { toggleOffItem, toggleOnAttributeKey } from 'lib/router'
import { useRouter } from 'next/router'
import { FC } from 'react'
import AttributeSelector from './filter/AttributeSelector'

type Props = {
  attributes: paths['/attributes']['get']['responses']['200']['schema']
  setTokensSize: any
}

const Sidebar: FC<Props> = ({ setTokensSize, attributes }) => {
  const router = useRouter()

  return (
    <Accordion.Root type="multiple" className="my-3 space-y-2.5">
      <div className="overflow-hidden rounded-md border border-neutral-200 dark:border-neutral-800">
        <button
          onClick={() => {
            router.query?.attribute_key === ''
              ? toggleOffItem(router, 'attribute_key')
              : toggleOnAttributeKey(router, 'attribute_key', '')
          }}
          className={`w-full px-3 py-2 text-left transition ${
            router.query.attribute_key &&
            router.query.attribute_key.toString() === ''
              ? 'bg-neutral-800 text-neutral-50 hover:bg-neutral-900 dark:bg-neutral-300 dark:text-black dark:hover:bg-neutral-200'
              : 'hover:bg-neutral-200 dark:hover:bg-neutral-800'
          }`}
        >
          Explore All
        </button>
      </div>
      {attributes?.attributes?.map((attribute) => (
        <Accordion.Item
          value={`item-${attribute.key}`}
          key={attribute.key}
          className="overflow-hidden rounded-md border border-neutral-200 dark:border-neutral-800"
        >
          <Accordion.Header
            className={`flex w-full justify-between divide-x ${
              router.query.attribute_key &&
              router.query.attribute_key.toString() === attribute.key
                ? 'divide-neutral-800 dark:divide-neutral-200'
                : 'divide-neutral-200 dark:divide-neutral-800'
            }`}
          >
            <button
              onClick={() => {
                if (attribute.key) {
                  router.query?.attribute_key === attribute.key
                    ? toggleOffItem(router, 'attribute_key')
                    : toggleOnAttributeKey(
                        router,
                        'attribute_key',
                        attribute.key
                      )
                }
              }}
              className={`w-full px-3 py-2 text-left transition ${
                router.query.attribute_key &&
                router.query.attribute_key.toString() === attribute.key
                  ? 'bg-neutral-800 text-neutral-50 hover:bg-neutral-900 dark:bg-neutral-300 dark:text-black dark:hover:bg-neutral-200'
                  : 'hover:bg-neutral-200 dark:hover:bg-neutral-800'
              }`}
            >
              {attribute.key}
            </button>
            <Accordion.Trigger
              className={`transition hover:bg-neutral-200 dark:hover:bg-neutral-800 ${
                router.query.attribute_key &&
                router.query.attribute_key.toString() === attribute.key
                  ? 'bg-neutral-800 text-neutral-50 hover:bg-neutral-900 dark:bg-neutral-300 dark:text-black dark:hover:bg-neutral-200'
                  : 'hover:bg-neutral-200 dark:hover:bg-neutral-800'
              }`}
            >
              <HiChevronDown className="h-7 w-9" aria-hidden />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content>
            <AttributeSelector
              attribute={attribute}
              setTokensSize={setTokensSize}
            />
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  )
}

export default Sidebar
