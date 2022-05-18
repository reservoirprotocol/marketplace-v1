import useCollection from 'hooks/useCollection'
import useDetails from 'hooks/useDetails'
import { optimizeImage } from 'lib/optmizeImage'
import Link from 'next/link'
import React, { FC } from 'react'

type Props = {
  collection: ReturnType<typeof useCollection>
  details: ReturnType<typeof useDetails>
}

const CollectionInfo: FC<Props> = ({ collection, details }) => {
  const token = details.data?.tokens?.[0]

  const tokenDescription =
    token?.token?.description ||
    collection.data?.collection?.metadata?.description

  return (
    <article className="col-span-full rounded-2xl border border-gray-300 bg-white p-6 dark:border-neutral-600 dark:bg-black">
      <div className="reservoir-h5 mb-4 dark:text-white">Collection Info</div>
      <Link href={`/collections/${collection.data?.collection?.id}`}>
        <a className="inline-flex items-center gap-2">
          <img
            src={optimizeImage(
              collection.data?.collection?.metadata?.imageUrl as string,
              50
            )}
            alt="collection avatar"
            className="h-9 w-9 rounded-full"
          />
          <span className="reservoir-h6 font-headings dark:text-white">
            {token?.token?.collection?.name}
          </span>
        </a>
      </Link>
      {tokenDescription && (
        <div className="reservoir-body-2 mt-4 break-words dark:text-white">
          {/* @ts-ignore */}
          {tokenDescription}
        </div>
      )}
    </article>
  )
}

export default CollectionInfo
