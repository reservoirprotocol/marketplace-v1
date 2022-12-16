import { ContractInterface } from 'ethers'
import {useCallback, useEffect, useState } from 'react'
import { useAccount, useContractRead, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi'

type CollectionInteractionResponse = {
  prepareConfig: any,
  prepareError: any,
  writeData: any,
  write: any
}


export default function useCollectionInteractions(addressOrName: string, tokenId: string, functionName: string, contractInterface: ContractInterface, args: any) {
  const [func, setFunc] = useState<CollectionInteractionResponse | undefined>()

  const { config, error } = usePrepareContractWrite({
    addressOrName,
    contractInterface,
    functionName,
    args,
  })

  const { data: callResponse, write } = useContractWrite(config)

  const onCall = useCallback(() => {
    if (write) {
      write()
    }
  }, [write])

  return {
    prepareConfig: config,
    prepareError: error,
    writeData: callResponse,
    write,
    execCollectionInteraction: onCall,
  }
}
