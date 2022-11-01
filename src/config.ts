// 1 - Required Variables
if (!process.env.NEXT_PUBLIC_NFTFY_API_BASE) {
  throw new Error('NEXT_PUBLIC_NFTFY_API_BASE is not set')
}

// 2 - Interfaces
export interface GlobalConfig {
  nftfy: {
    api: {
      base: string
    }
  }
  paginationLimit: number
  allowedChains: number[]
}

// 3 - Values
export const globalConfig: GlobalConfig = {
  nftfy: {
    api: {
      base: process.env.NEXT_PUBLIC_NFTFY_API_BASE
    }
  },
  paginationLimit: 50,
  allowedChains: [1, 5]
}

// 4 - Actions
export function isAllowedChain(chainId: number): boolean {
  return globalConfig.allowedChains.includes(chainId)
}
