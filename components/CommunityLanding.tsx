import useCommunity from 'hooks/useCommunity'
import Head from 'next/head'
import React, { FC } from 'react'
import CommunityGrid from './CommunityGrid'
import SearchCollections from './SearchCollections'

type Props = {
  apiBase: string
  collectionId: string
  mode: string
}

const CommunityLanding: FC<Props> = ({ apiBase, collectionId, mode }) => {
  const communities = useCommunity(apiBase, collectionId)

  const { data } = communities.communities

  const size = (data && data[data.length - 1].collections?.length) || 0

  const isBigCommunity = size > 8

  return (
    <>
      <Head>
        {/* {mode === 'global' ? (
          <title>
            {collectionId.toUpperCase()} Community Marketplace | Reservoir
            Market
          </title>
        ) : (
          <title>
            {collectionId.toUpperCase()} Community Marketplace | Powered by
            Reservoir
          </title>
        )} */}
        <title>
          Reservoir Market | Open source NFT marketplace powered by Reservoir
        </title>
        <meta
          name="description"
          content={
            communities.communities.data?.[0].collections?.[0]?.collection
              ?.description
          }
        />
      </Head>
      <header className="mt-40 mb-14 flex items-center justify-center gap-5">
        <img
          className="h-[50px] w-[50px] rounded-full"
          src={
            communities.communities.data?.[0].collections?.[0]?.collection
              ?.image
          }
        />
        <h1 className="reservoir-h1">
          {communityIds[collectionId] || collectionId} Community
        </h1>
      </header>
      {isBigCommunity && (
        <div className="mb-12 grid justify-center">
          <SearchCollections communityId={collectionId} />
        </div>
      )}
      <CommunityGrid communities={communities} />
    </>
  )
}

export default CommunityLanding

const communityIds: { [x: string]: any } = {
  loot: 'Loot',
  bayc: 'BAYC',
  forgottenrunes: 'Forgotten Runes',
  artblocks: 'Art Blocks',
}
