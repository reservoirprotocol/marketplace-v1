import useCommunity from 'hooks/useCommunity'
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
      <header className="mt-8 mb-14 flex items-center justify-center gap-5">
        <img
          className="h-[50px] w-[50px]"
          src={communities.data?.collections?.[0].collection?.image}
        />
        <h1 className=" text-xl font-bold uppercase">{wildcard} Community</h1>
      </header>
      <CommunityGrid communities={communities} wildcard={wildcard} />
    </>
  )
}

export default CommunityLanding
