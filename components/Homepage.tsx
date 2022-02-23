import useCollections from 'hooks/useCollections'
import Head from 'next/head'
import React, { FC } from 'react'
import CollectionsGrid from './CollectionsGrid'
import SearchCollection from './SearchCollections'

type Props = {
  apiBase: string
}

const Homepage: FC<Props> = ({ apiBase }) => {
  const collections = useCollections(apiBase)
  return (
    <>
      <Head>
        <title>
          Reservoir Market | Open source NFT marketplace powered by Reservoir
          Protocol
        </title>
      </Head>
      <header className="mb-10 flex items-center justify-center gap-5">
        <h1 className="mt-12 text-3xl font-bold">
          Discover, buy and sell NFTs
        </h1>
      </header>
      <div className="mb-12 grid justify-center">
        <SearchCollection />
      </div>
      <CollectionsGrid collections={collections} />
    </>
  )
}

export default Homepage
