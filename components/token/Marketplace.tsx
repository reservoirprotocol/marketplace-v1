import React, { FC } from 'react'
import useEnvChain from 'hooks/useEnvChain'
import { TokenDetails } from 'types/reservoir'

type IMarketplace = 'opensea' | 'looksrare' | 'x2y2' | 'quix'
interface IProps {
  marketplace: IMarketplace
  token?: TokenDetails
}

const MARKETPLACES = {
  opensea: {
    name: 'OpenSea',
    tokenUrl: (network = 'ethereum', token?: TokenDetails) => `https://opensea.io/assets/${network}/${token?.contract}/${token?.tokenId}`,
    networks: ['optimism', 'ethereum', 'polygon'],
    imgSrc: '/icons/OpenSea.svg',
  },
  looksrare: {
    name: 'LooksRare',
    tokenUrl: (_network = '', token?: TokenDetails) => `https://looksrare.org/collections/${token?.contract}/${token?.tokenId}`,
    networks: ['ethereum'],
    imgSrc: '/icons/LooksRare.svg',
  },
  x2y2: {
    name: 'X2Y2',
    tokenUrl: (_network = '', token?: TokenDetails) => `https://x2y2.io/eth/${token?.contract}/${token?.tokenId}`,
    networks: ['ethereum'],
    imgSrc: '/icons/X2Y2.svg',
  },
  quix: {
    name: 'Quix',
    tokenUrl: (_network = '', token?: TokenDetails) => `https://qx.app/asset/${token?.contract}/${token?.tokenId}`,
    networks: ['optimism'],
    imgSrc: '/icons/Quix.svg',
  }
}

const TokenMarketplace: FC<IProps> = ({ marketplace, token }) => {
  const chain = useEnvChain()
  const { name, tokenUrl, networks, imgSrc } = MARKETPLACES[marketplace]
  if (!networks.includes(chain?.network || 'ethereum')) return null

  return (
    <a
      className="reservoir-h6 font-headings"
      target="_blank"
      rel="noopener noreferrer"
      href={tokenUrl(chain?.network, token)}
    >
      <img
        src={imgSrc}
        alt={`${name} Icon`}
        className="h-6 w-6"
      />
    </a>
  )
}


export default TokenMarketplace