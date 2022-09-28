import Link from 'next/link'
import formatUrl from 'lib/formatUrl'
import { FC, useEffect, useState } from 'react'
import FormatEth from 'components/FormatEth'
import {
  Collection,
  TokenDetails,
  TokenDetailsAttribute,
} from 'types/reservoir'
import { formatNumber } from 'lib/numbers'
import { useContractRead, useNetwork } from 'wagmi'
import { ReactElement } from 'react-markdown/lib/react-markdown'

type Props = {
  token?: TokenDetails
  collection?: Collection
}

const TokenAttributes: FC<Props> = ({ token, collection }: Props) => {
  if (!token?.attributes || token?.attributes?.length === 0) return <TokenAttributesFallback token={token} collection={collection} />

  return (
    <TokenAttributeLayout>
      <>
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
      </>
    </TokenAttributeLayout>
  )
}

const TokenAttributeLayout = ({ children }: { children: ReactElement }) => {
  return (
    <div className="col-span-full md:col-span-4 lg:col-span-5 lg:col-start-2">
      <article className="col-span-full rounded-2xl border-[1px] border-gray-300 bg-white p-6 dark:border-neutral-600 dark:bg-black">
        <p className="reservoir-h5 mb-4 dark:text-white">Attributes</p>
        <div className="grid max-h-[440px] grid-cols-1 gap-2 overflow-y-auto lg:grid-cols-2">
          {children}
        </div>
      </article>
    </div>
  )
}

// In the event that the Reservoir Data Lake does not return traits for a token
// we can always go and check the tokenURI and hit the location of where that data is stored
// directly and store in browser.
const TokenAttributesFallback: FC<Props> = ({ token, collection }: Props) => {
  const [attributes, setAttributes] = useState(token?.attributes);
  const { chain: activeChain } = useNetwork()
  const { data: tokenURI } = useContractRead({
    addressOrName: collection?.id || '',
    contractInterface: [{
      "inputs": [
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "tokenURI",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },],
    functionName: 'tokenURI',
    args: token?.tokenId,
    chainId: activeChain?.id || 1,
  }) || null

  useEffect(() => {
    const fetchattributes = async () => {
      // Check if we have a local cache first - loads fastest and
      // attributes do not change often enough to matter.
      const cacheKey = `${collection?.id}::${token?.tokenId}_traits`
      const cachedAttributes = window?.localStorage.getItem(cacheKey)
      if (!!cachedAttributes) {
        setAttributes(JSON.parse(cachedAttributes))
        return
      }

      // Start the process of reading the token JSON
      // from IPFS.
      if (!tokenURI) return false
      const data = await fetch(ipfsURL(tokenURI.toString()), {
        method: 'GET',
        cache: 'force-cache'
      })
        .then((res) => res.json())
        .then((res) => res?.attributes)
        .catch(() => {
          console.error("Could not fetch response from contract tokenURI!")
          return null
        })
      if (!data) return

      const foundAttributes = data.map((trait: IContractTrait) => {
        const { trait_type: key, value } = trait
        return { key, value }
      })

      window?.localStorage.setItem(cacheKey, JSON.stringify(foundAttributes))
      setAttributes(foundAttributes)
    }
    fetchattributes()
  }, [tokenURI, token?.tokenId, collection?.id])

  return (
    <TokenAttributeLayout>
      <>
        {attributes?.map((attribute) => (
          <TokenAttribute
            key={attribute.key}
            attribute={attribute}
            collectionId={token?.collection?.id}
          />
        ))}
      </>
    </TokenAttributeLayout>
  )
}

interface IContractTrait {
  trait_type: string,
  value: string | number,
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
          {attribute.floorAskPrice && (
            <span>
              <FormatEth amount={attribute.floorAskPrice} />
            </span>
          )}
        </div>
        {attribute.tokenCount && (
          <div className="flex justify-between gap-1 text-xs dark:text-neutral-300">
            <span>
              {formatNumber(attribute.tokenCount)} ({attributeRarity}%) have this
            </span>
            <span>floor price</span>
          </div>
        )}
      </a>
    </Link>
  )
}

function ipfsURL(uri: string) {
  if (!uri.includes('ipfs://')) return uri
  const cid = uri.split('ipfs://')[1]
  const isPinata = cid[0] === 'Q'

  return isPinata ? `https://gateway.pinata.cloud/ipfs/${cid}` : `https://nftstorage.link/ipfs/${cid}`
}

export default TokenAttributes
