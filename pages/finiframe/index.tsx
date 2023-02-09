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
import RGL, { WidthProvider } from "react-grid-layout";
import { useCurrentSize } from 'hooks/useCurrentSize'

const ReactGridLayout = WidthProvider(RGL);

type Props = {
  finiId: string
}

const GridItem: FC<Props> = ({ finiId }) => {
  const [ finiData, updateFiniData ] = useState<FiniliarMetadata>()
  const [ windowHeight, updateWindowHeight ] = useState<number>()
  const [ windowWidth, updateWindowWidth ] = useState<number>()

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
    <div className="w-full h-full flex items-center justify-items-center" style={{ background: finiData?.background }}>
      <div className="h-full w-full m-auto flex items-center">
      <img
          alt="Token Image"
          className="w-full h-full max-h-[600px] max-w-[600px] object-contain"
          src={finiData?.image}
        />
      </div>
    </div>
  )
}



const FiniFrame: NextPage = () => {
  // read finis from localstorage
  const tempIds = ["722", "349", "827", "420", "999", "2392", "722", ]
  let windowSize = useCurrentSize()

  const columnCount = 6
  const tokenCount = tempIds.length

  let layout = () => {
    return tempIds.map((id, i) => {
      console.log(id, i)
      return {
        x: i,
        y: 1,
        w: 1,
        h: 1,
        i: id
      };
    })

  }

  console.log(layout())

  
  return (
    <div className="h-screen w-screen overflow-hidden">
      <ReactGridLayout
        className="layout"
        layout={layout()}
        // layouts={layouts}
        // breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        // cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        cols={columnCount}
        autoSize={true}
        rowHeight={windowSize.height / 3}
        margin={[0, 0]}
        // isResizable={true}
        // resizeHandles={['nw', 'se']}
        onLayoutChange={(layout) => console.log(layout)}
        isBounded={true}
      >
        {tempIds.map(id => {
          return (
            <div key={id}>
              <GridItem finiId={id} />
            </div>
          )
        })}
      </ReactGridLayout>
    </div>
  )
}

export default FiniFrame