import Link from 'next/link'
import formatUrl from 'lib/formatUrl'
import { FC } from 'react'
import FormatNativeCrypto from 'components/FormatNativeCrypto'
import {
  Collection,
  TokenDetails,
  TokenDetailsAttribute,
} from 'types/reservoir'
import { formatNumber } from 'lib/numbers'
import * as Accordion from '@radix-ui/react-accordion'
import { StyledChevron, StyledContent } from './radix/Accordion'
import useMounted from 'hooks/useMounted'

type Props = {
  token?: TokenDetails
  collection?: Collection
  isOwner?: boolean
}

const TokenAttributes: FC<Props> = ({ token, collection, isOwner }) => {
  const isMounted = useMounted()

  if (!isMounted) {
    return null
  }

  if (!token?.attributes || token?.attributes?.length === 0) return null

  return (
    <div className="col-span-full md:col-span-4 lg:col-span-5 lg:col-start-2">
      <Accordion.Root
        type="single"
        collapsible
        defaultValue={isOwner ? undefined : 'attributes'}
        className="col-span-full rounded-2xl border-[1px] border-gray-300 bg-white py-6 dark:border-neutral-600 dark:bg-black"
      >
        <Accordion.Item value="attributes">
          <Accordion.Header>
            <Accordion.Trigger className="reservoir-h5 -my-6 flex w-full items-center justify-between p-6 dark:text-white">
              <div>Attributes</div>
              <StyledChevron className="h-[9px] w-[9px] text-gray-600 dark:text-gray-300" />
            </Accordion.Trigger>
          </Accordion.Header>
          <StyledContent className="grid max-h-[440px] grid-cols-1 gap-2 overflow-y-auto px-6 lg:grid-cols-2">
            {token?.attributes
              ?.slice()
              .sort((a, b) => (b?.floorAskPrice || 0) - (a?.floorAskPrice || 0))
              .map((attribute) => (
                <TokenAttribute
                  key={attribute.key}
                  attribute={attribute}
                  collectionId={token?.collection?.id}
                  collectionTokenCount={collection?.tokenCount}
                />
              ))}
          </StyledContent>
        </Accordion.Item>
      </Accordion.Root>
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
            <FormatNativeCrypto amount={attribute.floorAskPrice} />
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
