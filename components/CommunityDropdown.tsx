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
    <DropdownMenu.Root onOpenChange={setOpen}>
      <DropdownMenu.Trigger className="text-md font-medium dark:text-white">
        Collection
        <FiChevronDown
          className={`ml-3 inline text-[#9CA3AF] transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </DropdownMenu.Trigger>

      <DropdownMenu.Content
        align="center"
        sideOffset={53}
        className="max-w-[422px] overflow-hidden rounded-2xl bg-white shadow-md radix-side-bottom:animate-slide-down dark:bg-neutral-900"
      >
        {collections?.map((collection) => {
          return (
            <DropdownMenu.Item asChild key={collection.collectionId}>
              <Link href={`/collections/${collection.collectionId}`}>
                <a
                  className={`reservoir-gray-dropdown-item rounded-none border-b px-6 py-4 dark:hover:bg-neutral-800 dark:focus:bg-neutral-800`}
                >
                  <img
                    src={collection.image}
                    alt={`${collection.name} Collection Image`}
                    className="h-9 w-9 shrink-0 overflow-hidden rounded-full"
                  />
                  <p className="truncate text-sm font-medium dark:text-white">
                    {collection.name} testan testan
                    testantestantestantestantestan testan testantestan
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
