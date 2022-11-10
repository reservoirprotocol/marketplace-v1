import { toggleOffAttribute, toggleOnAttribute, updateAttribute } from 'lib/url'
import { useRouter } from 'next/router'
import { toggleOffItem } from 'lib/router'
import { FC, MutableRefObject } from 'react'
import { SWRInfiniteResponse } from 'swr/infinite/dist/infinite'

type Props = {
  children: React.ReactNode
  attribute: string
  value: string
  refreshData: () => void
  scrollToTop: () => void
}

const AttributeButton: FC<Props> = ({
  children,
  attribute,
  value,
  refreshData,
  scrollToTop,
}) => {
  const router = useRouter()

  return (
    <button
      onClick={() => {
        router.query?.attribute_key && toggleOffItem(router, 'attribute_key')
        // Update the URL queries
        if (!router.query[`attributes[${attribute}]`]) {
          toggleOffItem(router, 'attribute_key')
          toggleOnAttribute(router, attribute, value)
        } else {
          if (router.query[`attributes[${attribute}]`] === value) {
            toggleOffAttribute(router, attribute)
          } else {
            updateAttribute(router, attribute, value)
          }
        }
        refreshData()
        scrollToTop()
      }}
      className={`flex w-full items-center justify-between gap-3 px-3 py-1 text-left ${
        router.query[`attributes[${attribute}]`] &&
        `${router.query[`attributes[${attribute}]`]}` === value
          ? 'bg-primary-100 hover:bg-primary-300 dark:bg-primary-900 dark:hover:bg-primary-700'
          : 'hover:bg-primary-100 dark:hover:bg-primary-900'
      } 
        `}
    >
      {children}
    </button>
  )
}

export default AttributeButton
