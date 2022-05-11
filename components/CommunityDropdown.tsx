import { FC, useState } from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { paths } from '@reservoir0x/client-sdk'
import { FiChevronDown } from 'react-icons/fi'
import Link from 'next/link'

type Props = {
  collections: paths['/search/collections/v1']['get']['responses']['200']['schema']['collections']
}

const CommunityDropdown: FC<Props> = ({ collections }) => {
  const [open, setOpen] = useState(false)

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger className="reservoir-h6 rounded dark:text-white dark:outline-none dark:ring-primary-900 dark:focus:ring-4">
        Collection
        <FiChevronDown
          className={`ml-3 inline text-[#525252] transition-transform dark:text-[#D4D4D4] ${
            open ? 'rotate-180' : ''
          }`}
        />
      </DropdownMenu.Trigger>

      <DropdownMenu.Content
        sideOffset={43}
        className="max-w-[300px] overflow-hidden rounded-2xl bg-white shadow-md radix-side-bottom:animate-slide-down dark:bg-neutral-900 md:max-w-[422px]"
      >
        {collections?.map((collection) => {
          return (
            <DropdownMenu.Item
              key={collection.collectionId}
              className="first:rounded-t-2xl last:rounded-b-2xl"
            >
              <Link href={`/collections/${collection.collectionId}`}>
                <a
                  onClick={() => {
                    setOpen(false)
                  }}
                  className={`reservoir-gray-dropdown-item rounded-none border-b px-6 py-4 last:border-b-0 dark:hover:bg-neutral-800 dark:focus:bg-neutral-800`}
                >
                  <img
                    src={collection.image}
                    alt={`${collection.name} Collection Image`}
                    className="h-9 w-9 shrink-0 overflow-hidden rounded-full"
                  />
                  <p className="reservoir-h6 truncate dark:text-white">
                    {collection.name}
                  </p>
                </a>
              </Link>
            </DropdownMenu.Item>
          )
        })}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}

export default CommunityDropdown
