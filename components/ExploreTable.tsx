import { paths } from '@reservoir0x/reservoir-kit-client'
import formatUrl from 'lib/formatUrl'
import { formatNumber } from 'lib/numbers'
import { optimizeImage } from 'lib/optmizeImage'
import Link from 'next/link'
import { useRouter } from 'next/router'
import FormatNativeCrypto from './FormatNativeCrypto'

const ExploreTable = ({
  mappedAttributes,
  viewRef,
}: {
  mappedAttributes: (
    | NonNullable<
        paths['/collections/{collection}/attributes/explore/v3']['get']['responses']['200']['schema']['attributes']
      >[0]
    | undefined
  )[]
  viewRef: (node?: Element | null | undefined) => void
}) => {
  const router = useRouter()

  return (
    <table className="mb-6 w-full table-auto">
      <thead>
        <tr className="text-left">
          <th className="pl-3">Key</th>
          <th className="pr-3">Value</th>
          <th className="pr-3">Count</th>
          <th className="whitespace-nowrap pr-3">On Sale</th>
          <th className="whitespace-nowrap pr-3">Floor Price</th>
          <th className="whitespace-nowrap pr-3">Top Offer</th>
          <th className="pr-3">Samples</th>
        </tr>
      </thead>
      <tbody>
        {mappedAttributes.map((attribute, index, arr) => (
          <tr
            key={`${attribute?.value}-${index}`}
            ref={index === arr.length - 5 ? viewRef : undefined}
            className="group even:bg-[#fefbff] dark:even:bg-neutral-900"
          >
            <td className="pl-3 pr-3">{attribute?.key}</td>
            <td className="h-px pr-3">
              <Link
                href={
                  router.query.id
                    ? `/collections/${router.query.id}?${formatUrl(
                        `attributes[${attribute?.key}]`
                      )}=${formatUrl(`${attribute?.value}`)}`
                    : `?${formatUrl(
                        `attributes[${attribute?.key}]`
                      )}=${formatUrl(`${attribute?.value}`)}`
                }
              >
                <a className="grid h-full items-center p-2 align-middle font-bold tracking-wide">
                  {attribute?.value}
                </a>
              </Link>
            </td>
            <td className="pr-3">{formatNumber(attribute?.tokenCount)}</td>
            <td className="pr-3">{formatNumber(attribute?.onSaleCount)}</td>
            <td className="pr-3">
              <FormatNativeCrypto
                amount={attribute?.floorAskPrices?.[0]}
                logoWidth={7}
              />
            </td>
            <td className="pr-3">
              <FormatNativeCrypto
                amount={attribute?.topBid?.value}
                logoWidth={7}
              />
            </td>

            <td className="w-[230px] pr-3">
              <Link
                href={
                  router.query.id
                    ? `/collections/${router.query.id}?${formatUrl(
                        `attributes[${attribute?.key}]`
                      )}=${formatUrl(`${attribute?.value}`)}`
                    : `?${formatUrl(
                        `attributes[${attribute?.key}]`
                      )}=${formatUrl(`${attribute?.value}`)}`
                }
              >
                <a>
                  <ExploreImages
                    sample_images={attribute?.sampleImages}
                    // @ts-ignore
                    value={attribute?.value}
                  />
                </a>
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default ExploreTable

const ExploreImages = ({
  sample_images,
  value,
}: {
  sample_images: NonNullable<
    paths['/collections/{collection}/attributes/explore/v3']['get']['responses']['200']['schema']['attributes']
  >[0]['sampleImages']
  value: NonNullable<
    paths['/collections/{collection}/attributes/explore/v3']['get']['responses']['200']['schema']['attributes']
  >[0]['value']
}) => (
  <div className="flex justify-start gap-1.5 py-1">
    {sample_images && sample_images?.length > 0 ? (
      // SMALLER IMAGE, HAS SIDE IMAGES
      sample_images.map((image) => (
        <img
          key={image}
          src={optimizeImage(image, 50)}
          alt={`${value}`}
          width="50"
          height="50"
        />
      ))
    ) : (
      <img
        src="https://via.placeholder.com/50"
        alt={`${value}`}
        width="50"
        height="50"
      />
    )}
  </div>
)
