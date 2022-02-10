import useCommunity from 'hooks/useCommunity'
import Head from 'next/head'
import React, { FC } from 'react'
import CommunityGrid from './CommunityGrid'

type Props = {
  wildcard: string
  apiBase: string
}

const CommunityLanding: FC<Props> = ({ apiBase, wildcard }) => {
  const communities = useCommunity(apiBase, wildcard)
  return (
    <>
      <Head>
        {wildcard === 'www' ? (
          <title>
            {wildcard.toUpperCase()} Community Marketplace | Reservoir Market
          </title>
        ) : (
          <title>
            {wildcard.toUpperCase()} Community Marketplace | Powered by
            Reservoir
          </title>
        )}
        <meta
          name="description"
          content={
            communities.communities.data?.[0].collections?.[0].collection
              ?.description
          }
        />
      </Head>
      <header className="mt-8 mb-14 flex items-center justify-center gap-5">
        <img
          className="h-[50px] w-[50px] rounded-full"
          src={
            communities.communities.data?.[0].collections?.[0].collection?.image
          }
        />
        <h1 className=" text-xl font-bold uppercase">{wildcard} Community</h1>
      </header>
      <CommunityGrid communities={communities} wildcard={wildcard} />
    </>
  )
}

export default CommunityLanding
