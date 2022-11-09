import { FC } from 'react'
import { optimizeImage } from 'lib/optmizeImage'
import FormatNativeCrypto from './FormatNativeCrypto'

type Props = {
  data: {
    token: {
      image: string | undefined
      name: string | undefined
      id: string | undefined
      contract: string | undefined
      topBuyValue: number | undefined
      floorSellValue: number | undefined
    }
    collection: {
      name: string | undefined
    }
  }
}

const StepsModalHeader: FC<Props> = ({ data }) => {
  if (data) {
    return (
      <>
        <div className="mb-3 flex items-center gap-4">
          <img
            src={optimizeImage(data.token.image, 50)}
            alt=""
            className="w-[50px]"
          />
          <div className="overflow-auto">
            <div className="text-sm">{data.collection.name}</div>
            <div className="my-1.5 text-lg font-medium">{data.token.name}</div>
            <div className="mb-1.5 text-sm">1 Eligible Token</div>
          </div>
        </div>
        <div className="mb-5 flex flex-wrap items-stretch gap-1.5 text-sm">
          {data.token.topBuyValue && (
            <div className="flex items-center gap-2 rounded-md bg-blue-100 px-2 py-0.5 text-blue-900">
              <span className="whitespace-nowrap">Current Top Offer</span>
              <div className="font-semibold">
                <FormatNativeCrypto
                  amount={data.token.topBuyValue}
                  logoWidth={7}
                />
              </div>
            </div>
          )}
          {data.token.floorSellValue && (
            <div className="flex items-center gap-2 rounded-md bg-blue-100 px-2 py-0.5 text-blue-900">
              <span className="whitespace-nowrap">List Price</span>
              <div className="font-semibold">
                <FormatNativeCrypto
                  amount={data.token.floorSellValue}
                  logoWidth={7}
                />
              </div>
            </div>
          )}
        </div>
      </>
    )
  }

  return null
}

export default StepsModalHeader
