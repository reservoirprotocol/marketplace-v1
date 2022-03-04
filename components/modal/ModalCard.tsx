import React, { FC, ReactNode } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { HiX } from 'react-icons/hi'
import { optimizeImage } from 'lib/optmizeImage'
import Steps from 'components/Steps'
import { Execute } from 'lib/executeSteps'
import FormatEth from 'components/FormatEth'

type Props = {
  title: string
  data: {
    token?: {
      image?: string | undefined
      name?: string | undefined
      id?: string | undefined
      contract?: string | undefined
      topBuyValue?: number | undefined
      floorSellValue?: number | undefined
    }
    collection?: {
      id?: string | undefined
      image?: string | undefined
      name?: string | undefined
      tokenCount?: number
    }
    attribute?: {
      key?: string | undefined
      value?: string | undefined
    }
  }
  onCloseCallback?: () => any
  actionButton?: ReactNode
  steps: Execute['steps']
}

const ModalCard: FC<Props> = ({
  children,
  title,
  data,
  onCloseCallback,
  actionButton,
  steps,
}) => {
  // SUBTITLE
  // Attribute Offer -> Loot (for Adventurers)
  // Collection Offer -> Collection
  // Token Offer -> Loot (for Adventurers)
  const subTitle =
    data?.attribute || data?.token ? data?.collection?.name : 'Collection'

  // If all executed succesfully, then success is true
  const success = steps && !steps.find(({ status }) => status === 'incomplete')

  return (
    <Dialog.Content className="fixed inset-0 bg-[#000000b6]">
      <div className="fixed top-1/2 left-1/2 w-[420px] -translate-x-1/2 -translate-y-1/2 transform rounded-md bg-white p-11 shadow-md ">
        <div className="mb-4 flex items-center justify-between">
          <Dialog.Title className="text-lg font-medium uppercase opacity-75">
            {title}
          </Dialog.Title>
          <Dialog.Close
            onClick={onCloseCallback}
            className="btn-neutral-ghost p-1.5"
          >
            <HiX className="h-5 w-5" />
          </Dialog.Close>
        </div>
        <div className="mb-5 flex items-center gap-4">
          <img
            src={optimizeImage(
              data?.collection?.image || data?.token?.image,
              50
            )}
            className="w-[50px]"
          />
          <div className="overflow-auto">
            <div className="text-sm">{subTitle}</div>
            <div className="my-1.5 text-lg font-medium">
              {/* If this is an offer modal, change */}
              {/* the header based on the type of offer */}
              {data?.attribute ? (
                <>
                  <span>{data?.attribute?.key}: </span>
                  <strong>{data?.attribute?.value}</strong>
                </>
              ) : data?.token ? (
                data?.token?.name
              ) : (
                data?.collection?.name
              )}
            </div>
            {data?.collection?.tokenCount && (
              <div className="mb-1.5 text-sm">
                {`${data?.collection?.tokenCount} Eligible Tokens`}
              </div>
            )}
          </div>
        </div>
        <div className="mb-5 flex flex-wrap items-stretch gap-1.5 text-sm">
          <TopOffer topBuyValue={data?.token?.topBuyValue} />
          <ListPrice floorSellValue={data?.token?.floorSellValue} />
        </div>
        {steps ? <Steps steps={steps} /> : children}
        {success ? (
          <Dialog.Close
            onClick={onCloseCallback}
            className="btn-green-fill w-full"
          >
            Success, Close this menu
          </Dialog.Close>
        ) : (
          <div className="flex items-center gap-4">
            <Dialog.Close
              onClick={onCloseCallback}
              className="btn-neutral-fill w-full"
            >
              Cancel
            </Dialog.Close>
            {actionButton}
          </div>
        )}
      </div>
    </Dialog.Content>
  )
}

export default ModalCard

export const ListPrice = ({
  floorSellValue,
}: {
  floorSellValue: number | undefined
}) => {
  if (floorSellValue) {
    return (
      <div className="flex items-center gap-2 rounded-md bg-blue-100 px-2 py-0.5 text-blue-900">
        <span className="whitespace-nowrap">List Price</span>
        <div className="font-semibold">
          <FormatEth
            amount={floorSellValue}
            maximumFractionDigits={4}
            logoWidth={7}
          />
        </div>
      </div>
    )
  }

  return null
}

export const TopOffer = ({
  topBuyValue,
}: {
  topBuyValue: number | undefined
}) => {
  if (topBuyValue) {
    return (
      <div className="flex items-center gap-2 rounded-md bg-blue-100 px-2 py-0.5 text-blue-900">
        <span className="whitespace-nowrap">Current Top Offer</span>
        <div className="font-semibold">
          <FormatEth
            amount={topBuyValue}
            maximumFractionDigits={4}
            logoWidth={7}
          />
        </div>
      </div>
    )
  }

  return null
}
