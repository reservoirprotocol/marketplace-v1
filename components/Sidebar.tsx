import * as Accordion from '@radix-ui/react-accordion'
import { paths } from 'interfaces/apiTypes'
import { toggleOffItem, toggleOnAttributeKey } from 'lib/router'
import { useRouter } from 'next/router'
import { FC } from 'react'
import AttributeSelector from './filter/AttributeSelector'
import { SWRResponse } from 'swr'
import { SWRInfiniteResponse } from 'swr/infinite/dist/infinite'
import { FiChevronDown } from 'react-icons/fi'

type Props = {
  attributes: SWRResponse<
    paths['/attributes']['get']['responses']['200']['schema']
  >
  setTokensSize: SWRInfiniteResponse['setSize']
}

const Sidebar: FC<Props> = ({ attributes, setTokensSize }) => {
  const router = useRouter()

  return (
    <Accordion.Root
      type="multiple"
      className="mb-3 hidden w-[220px] flex-none border-r-[1px] border-gray-300 md:block lg:w-[260px] xl:w-[374px]"
    >
      <div className="overflow-hidden">
        <button
          onClick={() => {
            router.query?.attribute_key === ''
              ? toggleOffItem(router, 'attribute_key')
              : toggleOnAttributeKey(router, 'attribute_key', '')
          }}
          className={`reservoir-h6 w-full border-b-[1px] border-gray-300 px-6 py-5 text-left transition ${
            router.query.attribute_key &&
            router.query.attribute_key.toString() === ''
              ? 'bg-primary-100 hover:bg-primary-300'
              : 'hover:bg-primary-100'
          }`}
        >
          Explore All
        </button>
      </div>
      {attributes.data?.attributes?.map((attribute) => (
        <Accordion.Item
          value={`item-${attribute.key}`}
          key={attribute.key}
          className="overflow-hidden"
        >
          <Accordion.Header
            className={`flex w-full justify-between border-b-[1px] border-gray-300 ${
              router.query.attribute_key &&
              router.query.attribute_key.toString() === attribute.key
                ? 'divide-gray-800 dark:divide-gray-300'
                : 'divide-gray-300 dark:divide-gray-800'
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
              className={`reservoir-h6 w-full py-5 px-6 text-left capitalize transition ${
                router.query.attribute_key &&
                router.query.attribute_key.toString() === attribute.key
                  ? 'bg-primary-100 hover:bg-primary-300'
                  : 'hover:bg-primary-100'
              }`}
            >
              {attribute.key}
            </button>
            <div
              className={`flex items-center ${
                router.query.attribute_key &&
                router.query.attribute_key.toString() === attribute.key
                  ? 'bg-primary-100 hover:bg-primary-300'
                  : 'hover:bg-primary-100'
              }`}
            >
              <div className="h-6 w-px bg-gray-300"></div>
              <Accordion.Trigger className="p-5 transition">
                <FiChevronDown className="h-5 w-5" aria-hidden />
              </Accordion.Trigger>
            </div>
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
