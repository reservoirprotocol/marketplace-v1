import Link from 'next/link'
import formatUrl from 'lib/formatUrl'
import { FC } from 'react'
import FormatEth from 'components/FormatEth'
import {
  Collection,
  TokenDetails,
  TokenDetailsAttribute,
} from 'types/reservoir'
import { formatNumber } from 'lib/numbers'

type Props = {
  token?: TokenDetails
  collection?: Collection
}

const TokenAttributes: FC<Props> = ({ token, collection }: Props) => {
  if (token?.attributes?.length === 0) return null

  return (
    <div className="col-span-full md:col-span-4 lg:col-span-5 lg:col-start-2">
      <article className="col-span-full rounded-2xl border-[1px] border-gray-300 bg-white p-6 dark:border-neutral-600 dark:bg-black">
        <p className="reservoir-h5 mb-4 dark:text-white">Attributes</p>
        <div className="grid max-h-[440px] grid-cols-1 gap-2 overflow-y-auto lg:grid-cols-2">
          {token?.attributes
            ?.sort((a, b) => (b?.floorAskPrice || 0) - (a?.floorAskPrice || 0))
            .map((attribute) => (
              <TokenAttribute
                key={attribute.key}
                attribute={attribute}
                collectionId={token?.collection?.id}
                collectionTokenCount={collection?.tokenCount}
              />
            ))}
        </div>
      </article>
    </div>
  )
}

type TokenAttributeProps = {
  attribute: TokenDetailsAttribute
  collectionId?: string
  collectionTokenCount?: string
}

const TokenAttribute: FC<TokenAttributeProps> = ({
  attribute,
  collectionId,
  collectionTokenCount,
}) => {
  const attributeTokenCount = attribute?.tokenCount || 0
  const totalTokens = collectionTokenCount ? +collectionTokenCount : 0
  const attributeRarity = formatNumber(
    (attributeTokenCount / totalTokens) * 100,
    1
  )

  return (
    <Link
      key={`${attribute.key}-${attribute.value}`}
      href={`/collections/${collectionId}?${formatUrl(
        `attributes[${attribute.key}]`
      )}=${formatUrl(`${attribute.value}`)}`}
    >
      <a className="rounded-lg bg-neutral-100 px-4 py-3 ring-inset ring-blue-600 transition-colors	hover:bg-neutral-300 focus-visible:outline-none focus-visible:ring-2 dark:bg-neutral-800 dark:hover:bg-neutral-600">
        <div className="text-sm text-primary-700 dark:text-primary-300">
          {attribute.key}
        </div>
        <div className="mb-1 mt-2 flex justify-between gap-1 text-sm text-black dark:text-white">
          <span
            className="reservoir-h6 text-black dark:text-white"
            title={attribute.value}
          >
            {attribute.value}
          </span>
          <span>
            <FormatEth amount={attribute.floorAskPrice} />
          </span>
        </div>
        <div className="flex justify-between gap-1 text-xs dark:text-neutral-300">
          <span>
            {formatNumber(attribute.tokenCount)} ({attributeRarity}%) have this
          </span>
          <span>floor price</span>
        </div>
      </a>
    </Link>
  )
}

export default TokenAttributes
