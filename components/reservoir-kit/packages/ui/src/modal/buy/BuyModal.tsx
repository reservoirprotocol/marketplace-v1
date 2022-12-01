/*
import React, { Dispatch, ReactElement, SetStateAction, useEffect } from 'react'
import { useCopyToClipboard, useFallbackState } from '../../../../../../../hooks'

import {
  Flex,
  Box,
  Text,
  Input,
  Anchor,
  Button,,
  FormatCurrency,
  FormatCryptoCurrency,
  Loader,
  Select,
} from '../../primitives'

import { Progress } from './Progress'
import Popover from '../../primitives/Popover'
import { Modal } from '../../../../../../modal'
import {
  faCopy,
  faCircleExclamation,
  faCheckCircle,
  faExchange,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import TokenLineItem from '../TokenLineItem'
import { BuyModalRenderer, BuyStep } from './BuyModalRenderer'
import { Execute } from '@reservoir0x/reservoir-kit-client'
import ProgressBar from '../ProgressBar'

type PurchaseData = {
  tokenId?: string
  collectionId?: string
  maker?: string
  steps?: Execute['steps']
}

type Props = Pick<Parameters<typeof Modal>['0'], 'trigger'> & {
  openState?: [boolean, Dispatch<SetStateAction<boolean>>]
  tokenId?: string
  collectionId?: string
  orderId?: string
  referrerFeeBps?: number | null
  referrer?: string | null
  normalizeRoyalties?: boolean
  onGoToToken?: () => any
  onPurchaseComplete?: (data: PurchaseData) => void
  onPurchaseError?: (error: Error, data: PurchaseData) => void
  onClose?: () => void
}

function titleForStep(step: BuyStep) {
  switch (step) {
    case BuyStep.AddFunds:
      return 'Add Funds'
    case BuyStep.Unavailable:
      return 'Selected item is no longer Available'
    default:
      return 'Complete Checkout'
  }
}

export function BuyModal({
                           openState,
                           trigger,
                           tokenId,
                           collectionId,
                           orderId,
                           referrer,
                           referrerFeeBps,
                           normalizeRoyalties,
                           onPurchaseComplete,
                           onPurchaseError,
                           onClose,
                           onGoToToken,
                         }: Props): ReactElement {
  const [open, setOpen] = useFallbackState(
    openState ? openState[0] : false,
    openState
  )
  const { copy: copyToClipboard, copied } = useCopyToClipboard()

  return (
    <BuyModalRenderer
      open={open}
      tokenId={tokenId}
      collectionId={collectionId}
      orderId={orderId}
      referrer={referrer}
      referrerFeeBps={referrerFeeBps}
      normalizeRoyalties={normalizeRoyalties}
    >
      {({
          token,
          collection,
          listing,
          quantityAvailable,
          quantity,
          currency,
          totalPrice,
          referrerFee,
          buyStep,
          transactionError,
          hasEnoughCurrency,
          steps,
          stepData,
          feeUsd,
          totalUsd,
          usdPrice,
          isBanned,
          balance,
          address,
          etherscanBaseUrl,
          setQuantity,
          setBuyStep,
          buyToken,
        }) => {
        const title = titleForStep(buyStep)

        useEffect(() => {
          if (buyStep === BuyStep.Complete && onPurchaseComplete) {
            const data: PurchaseData = {
              tokenId: tokenId,
              collectionId: collectionId,
              maker: address,
            }
            if (steps) {
              data.steps = steps
            }
            onPurchaseComplete(data)
          }
        }, [buyStep])

        useEffect(() => {
          if (transactionError && onPurchaseError) {
            const data: PurchaseData = {
              tokenId: tokenId,
              collectionId: collectionId,
              maker: address,
            }
            onPurchaseError(transactionError, data)
          }
        }, [transactionError])

        const executableSteps =
          steps?.filter((step) => step.items && step.items.length > 0) || []
        const lastStepItems =
          executableSteps[executableSteps.length - 1]?.items || []
        let finalTxHash = lastStepItems[lastStepItems.length - 1]?.txHash

        let price = (listing?.price?.amount?.decimal || 0) * quantity

        if (!price && token?.token?.lastSell?.value) {
          price = token?.token.lastSell.value
        }

        const sourceImg = listing?.source
          ? (listing?.source['icon'] as string)
          : undefined

        return (
          <Modal
            trigger={trigger}
            title={title}
            onBack={
              buyStep == BuyStep.AddFunds
                ? () => {
                  setBuyStep(BuyStep.Checkout)
                }
                : null
            }
            open={open}
            onOpenChange={(open) => {
              setOpen(open)
            }}
            loading={!token}
          >
            {buyStep === BuyStep.Unavailable && token && (
              <Flex direction="column">
                <TokenLineItem
                  tokenDetails={token}
                  collection={collection}
                  isSuspicious={isBanned}
                  usdConversion={usdPrice || 0}
                  isUnavailable={true}
                  price={price}
                  currency={currency}
                  sourceImg={sourceImg}
                />
                <Button
                  onClick={() => {
                    setOpen(false)
                  }}
                  css={{ m: '$4' }}
                >
                  Close
                </Button>
              </Flex>
            )}

            {buyStep === BuyStep.Checkout && token && (
              <Flex direction="column">
                {transactionError && (
                  <Flex
                    css={{
                      color: '$errorAccent',
                      p: '$4',
                      gap: '$2',
                      background: '$wellBackground',
                    }}
                    align="center"
                  >
                    <FontAwesomeIcon
                      icon={faCircleExclamation}
                      width={16}
                      height={16}
                    />
                    <Text style="body2" color="errorLight">
                      {transactionError.message}
                    </Text>
                  </Flex>
                )}
                <TokenLineItem
                  tokenDetails={token}
                  collection={collection}
                  usdConversion={usdPrice || 0}
                  isSuspicious={isBanned}
                  price={price}
                  currency={currency}
                  sourceImg={sourceImg}
                />
                {quantityAvailable > 1 && (
                  <Flex
                    css={{ pt: '$4', px: '$4' }}
                    align="center"
                    justify="between"
                  >
                    <Text style="body2" color="subtle">
                      {quantityAvailable} listings are available at this price
                    </Text>
                    <Select
                      css={{ minWidth: 77, width: 'auto', flexGrow: 0 }}
                      value={`${quantity}`}
                      onValueChange={(value: string) => {
                        setQuantity(Number(value))
                      }}
                    >
                      {[...Array(quantityAvailable)].map((_a, i) => (
                        <Select.Item key={i} value={`${i + 1}`}>
                          <Select.ItemText>{i + 1}</Select.ItemText>
                        </Select.Item>
                      ))}
                    </Select>
                  </Flex>
                )}
                {referrerFee > 0 && (
                  <>
                    <Flex
                      align="center"
                      justify="between"
                      css={{ pt: '$4', px: '$4' }}
                    >
                      <Text style="subtitle2">Referral Fee</Text>
                      <FormatCryptoCurrency
                        amount={referrerFee}
                        address={currency?.contract}
                        decimals={currency?.decimals}
                      />
                    </Flex>
                    <Flex justify="end">
                      <FormatCurrency
                        amount={feeUsd}
                        color="subtle"
                        css={{ pr: '$4' }}
                      />
                    </Flex>
                  </>
                )}

                <Flex
                  align="center"
                  justify="between"
                  css={{ pt: '$4', px: '$4' }}
                >
                  <Text style="h6">Total</Text>
                  <FormatCryptoCurrency
                    textStyle="h6"
                    amount={totalPrice}
                    address={currency?.contract}
                    decimals={currency?.decimals}
                  />
                </Flex>
                <Flex justify="end">
                  <FormatCurrency
                    amount={totalUsd}
                    color="subtle"
                    css={{ mr: '$4' }}
                  />
                </Flex>

                <Box css={{ p: '$4', width: '100%' }}>
                  {hasEnoughCurrency ? (
                    <Button
                      onClick={buyToken}
                      css={{ width: '100%' }}
                      color="primary"
                    >
                      Checkout
                    </Button>
                  ) : (
                    <Flex direction="column" align="center">
                      <Flex align="center" css={{ mb: '$3' }}>
                        <Text css={{ mr: '$3' }} color="error" style="body2">
                          Insufficient Balance
                        </Text>

                        <FormatCryptoCurrency
                          amount={balance}
                          address={currency?.contract}
                          decimals={currency?.decimals}
                          textStyle="body2"
                        />
                      </Flex>

                      <Button
                        onClick={() => {
                          setBuyStep(BuyStep.AddFunds)
                        }}
                        css={{ width: '100%' }}
                      >
                        Add Funds
                      </Button>
                    </Flex>
                  )}
                </Box>
              </Flex>
            )}

            {buyStep === BuyStep.Approving && token && (
              <Flex direction="column">
                <TokenLineItem
                  tokenDetails={token}
                  collection={collection}
                  usdConversion={usdPrice || 0}
                  isSuspicious={isBanned}
                  price={price}
                  currency={currency}
                  sourceImg={sourceImg}
                />
                {stepData && stepData.totalSteps > 1 && (
                  <ProgressBar
                    css={{ px: '$4', mt: '$3' }}
                    value={stepData?.stepProgress || 0}
                    max={stepData?.totalSteps || 0}
                  />
                )}
                {!stepData && <Loader css={{ height: 206 }} />}
                {stepData && (
                  <Progress
                    title={stepData?.currentStep.action || ''}
                    txHash={stepData?.currentStepItem.txHash}
                    etherscanBaseUrl={`${etherscanBaseUrl}/tx/${stepData?.currentStepItem.txHash}`}
                  />
                )}
                <Button disabled={true} css={{ m: '$4' }}>
                  <Loader />
                  {stepData?.currentStepItem.txHash
                    ? 'Waiting for transaction to be validated'
                    : 'Waiting for approval...'}
                </Button>
              </Flex>
            )}

            {buyStep === BuyStep.Complete && token && (
              <Flex direction="column">
                <Flex
                  css={{
                    p: '$4',
                    py: '$5',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                  }}
                >
                  <Text style="h5" css={{ mb: 24 }}>
                    Congratulations!
                  </Text>
                  <img
                    src={token?.token?.image}
                    style={{ width: 100, height: 100 }}
                  />
                  <Flex
                    css={{ mb: 24, mt: '$2', maxWidth: '100%' }}
                    align="center"
                    justify="center"
                  >
                    {!!token.token?.collection?.image && (
                      <Box css={{ mr: '$1' }}>
                        <img
                          src={token.token?.collection?.image}
                          style={{ width: 24, height: 24, borderRadius: '50%' }}
                        />
                      </Box>
                    )}

                    <Text
                      style="subtitle2"
                      css={{ maxWidth: '100%' }}
                      ellipsify
                    >
                      {token?.token?.name
                        ? token?.token?.name
                        : `#${token?.token?.tokenId}`}
                    </Text>
                  </Flex>

                  <Flex css={{ mb: '$2' }} align="center">
                    <Box css={{ color: '$successAccent', mr: '$2' }}>
                      <FontAwesomeIcon icon={faCheckCircle} />
                    </Box>
                    <Text style="body1">
                      Your transaction went through successfully
                    </Text>
                  </Flex>
                  <Anchor
                    color="primary"
                    weight="medium"
                    css={{ fontSize: 12 }}
                    href={`${etherscanBaseUrl}/tx/${finalTxHash}`}
                    target="_blank"
                  >
                    View on Etherscan
                  </Anchor>
                </Flex>
                <Flex
                  css={{
                    p: '$4',
                    flexDirection: 'column',
                    gap: '$3',
                    '@bp1': {
                      flexDirection: 'row',
                    },
                  }}
                >
                  {!!onGoToToken ? (
                    <>
                      <Button
                        onClick={() => {
                          setOpen(false)
                          if (onClose) {
                            onClose()
                          }
                        }}
                        css={{ flex: 1 }}
                        color="ghost"
                      >
                        Close
                      </Button>
                      <Button
                        style={{ flex: 1 }}
                        color="primary"
                        onClick={() => {
                          onGoToToken()
                          if (onClose) {
                            onClose()
                          }
                        }}
                      >
                        Go to Token
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => {
                        setOpen(false)
                        if (onClose) {
                          onClose()
                        }
                      }}
                      style={{ flex: 1 }}
                      color="primary"
                    >
                      Close
                    </Button>
                  )}
                </Flex>
              </Flex>
            )}

            {buyStep === BuyStep.AddFunds && token && (
              <Flex direction="column">
                <Flex
                  css={{
                    p: '$4',
                    py: '$5',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                  }}
                >
                  <Box css={{ color: '$neutralText' }}>
                    <FontAwesomeIcon
                      icon={faExchange}
                      style={{
                        width: '32px',
                        height: '32px',
                        margin: '12px 0px',
                      }}
                    />
                  </Box>
                  <Text style="subtitle1" css={{ my: 24 }}>
                    <Popover
                      content={
                        <Text style={'body2'}>
                          Trade one crypto for another on a crypto exchange.
                          Popular decentralized exchanges include{' '}
                          <Anchor
                            css={{ fontSize: 12 }}
                            href="https://app.uniswap.org/"
                            target="_blank"
                            color="primary"
                          >
                            Uniswap
                          </Anchor>
                          ,{' '}
                          <Anchor
                            css={{ fontSize: 12 }}
                            href="https://app.sushi.com/"
                            target="_blank"
                            color="primary"
                          >
                            SushiSwap
                          </Anchor>{' '}
                          and many others.
                        </Text>
                      }
                    >
                      <Text as="span" color="accent">
                        Exchange currencies
                      </Text>
                    </Popover>{' '}
                    or transfer funds to your
                    <br /> wallet address below:
                  </Text>
                  <Box css={{ width: '100%', position: 'relative' }}>
                    <Flex
                      css={{
                        pointerEvents: 'none',
                        opacity: copied ? 1 : 0,
                        position: 'absolute',
                        inset: 0,
                        borderRadius: 8,
                        transition: 'all 200ms ease-in-out',
                        pl: '$4',
                        alignItems: 'center',
                        zIndex: 3,
                        textAlign: 'left',
                        background: '$neutralBg',
                      }}
                    >
                      <Text style={'body1'}>Copied Address!</Text>
                    </Flex>
                    <Input
                      readOnly
                      onClick={() => copyToClipboard(address as string)}
                      value={address || ''}
                      css={{
                        color: '$neutralText',
                        textAlign: 'left',
                      }}
                    />
                    <Box
                      css={{
                        position: 'absolute',
                        right: '$3',
                        top: '50%',
                        touchEvents: 'none',
                        transform: 'translateY(-50%)',
                        color: '$neutralText',
                        pointerEvents: 'none',
                      }}
                    >
                      <FontAwesomeIcon icon={faCopy} width={16} height={16} />
                    </Box>
                  </Box>
                </Flex>
                <Button
                  css={{ m: '$4' }}
                  color="primary"
                  onClick={() => copyToClipboard(address as string)}
                >
                  Copy Wallet Address
                </Button>
              </Flex>
            )}
          </Modal>
        )
      }}
    </BuyModalRenderer>
  )
}

BuyModal.Custom = BuyModalRenderer

 */