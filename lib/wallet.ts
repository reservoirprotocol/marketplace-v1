import Toast from 'components/Toast'
import { ethers } from 'ethers'
import { ComponentProps } from 'react'
import { useConnect, useSigner } from 'wagmi'

export const checkWallet = async (
  signer: ReturnType<typeof useSigner>['data'],
  setToast: (data: ComponentProps<typeof Toast>['data']) => any,
  connect: ReturnType<typeof useConnect>['connect'],
  connectors: ReturnType<typeof useConnect>['connectors']
) => {
  if (!signer) {
    const data = connect(connectors[0])
    // if (data) {
    //   setToast({
    //     kind: 'success',
    //     message: 'Connected your wallet successfully.',
    //     title: 'Wallet connected',
    //   })
    // }
  }
}
