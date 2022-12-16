import React, { FC } from 'react'
import { setToast } from './setToast'
import useCollectionInteractions from '../../hooks/useCollectionInteractions'

type Props = {
  button: any
  tokenId: string
}

const TokenInteractionButton: FC<Props> = ({ button, tokenId }) => {
  const collectionInteractions = useCollectionInteractions(button.addressOrName, tokenId, button.functionName, button.contractInterface, [tokenId])

  return (
    <button
        className="btn-primary-outline reservoir-h6 ml-auto flex items-center gap-2 p-2 font-headings text-primary-700 dark:border-neutral-600 dark:text-primary-100 dark:ring-primary-900 dark:focus:ring-4"
        title="Wash this car"
        onClick={() => {
          if (!!collectionInteractions?.prepareError) {
            const errorString = JSON.stringify(collectionInteractions?.prepareError)
            const errorParsed = JSON.parse(errorString) || {}
            const errorReason = errorParsed?.reason?.replace('execution reverted: ', '')
            setToast({
              kind: 'error',
              message: errorReason || 'Interaction not possible at the moment.',
              title: `${button.label} failed`,
            })
          } else {
            collectionInteractions?.execCollectionInteraction()
          }
        }}
    >{button.label}</button>
  )
}

export default TokenInteractionButton
