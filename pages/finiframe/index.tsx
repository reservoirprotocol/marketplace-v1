import { NextPage } from 'next'
import React, {
  ComponentPropsWithoutRef,
  Dispatch,
  FC,
  SetStateAction,
  useEffect,
  useState,
} from 'react'
import { useLocalStorage } from 'hooks/useLocalStorage'
import { FiniliarMetadata } from 'lib/fetchFromFiniliar'
import { fetchMetaFromFiniliar } from 'lib/fetchFromFiniliar'

type Props = {
  finiId: string
}

const GridItem: FC<Props> = ({ finiId }) => {
  const [ finiData, updateFiniData ] = useState<FiniliarMetadata>()

  // fetch finis from server
  useEffect(() => {
    fetchMetaFromFiniliar(finiId).then((res) => {
      updateFiniData({
        latestPrice: res.latestPrice,
        latestDelta: res.latestDelta,
        image: res.image,
        background: res.background,
        attributes: res.attributes
      })
    }).catch((err) => {
      console.log(`Error fetching data for token id ${finiId}:`, err)
    })
  }, [finiId])

  return (
    <div className="h-screen w-screen flex items-center justify-items-center" style={{ background: finiData?.background }}>
      <div className="max-w-[600px] m-auto min-h-[600px] flex items-center">
      <img
          alt="Token Image"
          className="w-full rounded-2xl"
          src={finiData?.image}
        />
      </div>
    </div>
  )
}

const FiniFrame: NextPage = () => {
  // read finis from localstorage
  // const tempIds = ["722", "349", "827"]
  
  return (
    <div>
      <GridItem finiId="722" />
      <GridItem finiId="349" />
      <GridItem finiId="287" />
    </div>
  )
}

export default FiniFrame