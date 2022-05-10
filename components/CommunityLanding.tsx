import useCommunity from 'hooks/useCommunity'
import Head from 'next/head'
import React, { FC } from 'react'
import CommunityGrid from './CommunityGrid'
import SearchCollections from './SearchCollections'

const metaTitle = process.env.NEXT_PUBLIC_META_TITLE
const metaDescription = process.env.NEXT_PUBLIC_META_DESCRIPTION

type Props = {
  collectionId: string
  mode: string
}

const CommunityLanding: FC<Props> = ({ collectionId, mode }) => {
  const communities = useCommunity(collectionId)

  const { data } = communities.communities

  const size = (data && data[data.length - 1].collections?.length) || 0

  const isBigCommunity = size > 8

  const title = metaTitle ? (
    <title>{metaTitle}</title>
  ) : (
    <title>
      Reservoir Market | Open source NFT marketplace powered by Reservoir
    </title>
  )
  const description = metaDescription ? (
    <meta name="description" content={metaDescription} />
  ) : (
    <meta
      name="description"
      content={
        // prettier-ignore
        // @ts-ignore
        communities.communities.data?.[0].collections?.[0]?.metadata
        ?.description
      }
    />
  )

  return (
    <>
      <Head>
        {title}
        {description}
      </Head>
      <header className="col-span-full mb-10 mt-40 flex items-center justify-center">
        <img
          className="mr-4 h-[50px] w-[50px] rounded-full"
          src={communities.communities.data?.[0].collections?.[0]?.image}
        />
        <h1 className="reservoir-h1 font-headings">
          {communityIds[collectionId] || collectionId} Community
        </h1>
      </header>
      {isBigCommunity && (
        <div className="col-span-full mb-12 md:col-span-4 md:col-start-3 lg:col-span-4 lg:col-start-5">
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
