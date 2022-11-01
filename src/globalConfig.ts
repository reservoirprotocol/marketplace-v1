
export interface GlobalConfig {
    nftfyBackend: string 
    paginationLimit: number
    allowedChains: number[]
    pollingInterval: number
    nftfyMarketplaceUrl: string
  }
  
  if (!process.env.NEXT_PUBLIC_BACKEND_URL) {
    throw new Error('NEXT_PUBLIC_BACKEND_URL is not set')
  }

export const globalConfig: GlobalConfig = {
  nftfyBackend: process.env.NEXT_PUBLIC_BACKEND_URL ,
  paginationLimit: 50,
  allowedChains: [1, 4, 5],
  pollingInterval: 30000,
  nftfyMarketplaceUrl: 'https://app.marketplace.nftfy.org/'
}

export function isAllowedChain(chainId: number): boolean {
  return globalConfig.allowedChains.includes(chainId)
}
