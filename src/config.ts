// 1 - Required Variables
if (!process.env.NEXT_PUBLIC_CHAIN_ID) {
  throw new Error('NEXT_PUBLIC_CHAIN_ID is not set')
}

if (!process.env.NEXT_PUBLIC_NFTFY_API_BASE) {
  throw new Error('NEXT_PUBLIC_NFTFY_API_BASE is not set')
}

// 2 - Interfaces
export interface GlobalConfig {
  chain: number
  nftfy: {
    api: {
      base: string
    }
  }
  paginationLimit: number
}

// 3 - Values
export const globalConfig: GlobalConfig = {
  chain: Number(process.env.NEXT_PUBLIC_CHAIN_ID),
  nftfy: {
    api: {
      base: process.env.NEXT_PUBLIC_NFTFY_API_BASE
    }
  },
  paginationLimit: 50
}
