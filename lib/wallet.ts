import Toast from 'components/Toast'
import { ethers } from 'ethers'
import { ComponentProps } from 'react'
import { useConnect } from 'wagmi'

export const checkWallet = async (
  signer: ethers.Signer | undefined,
  setToast: (data: ComponentProps<typeof Toast>['data']) => any,
  connect: ReturnType<typeof useConnect>['1'],
  connectData: ReturnType<typeof useConnect>['0']['data']
) => {
  if (!signer) {
    const data = await connect(connectData.connectors[0])
    if (data?.data) {
      setToast({
        kind: 'success',
        message: 'Connected your wallet successfully.',
        title: 'Wallet connected',
      })
    }
  }
}
