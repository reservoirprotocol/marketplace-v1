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
import getAttributeFromFreshData from 'lib/getAttributeFromFreshData'
import { useLocalStorageValue } from '@react-hookz/web'
import getColor from 'lib/getColor'
import Head from 'next/head'

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

  let color
  if (finiData) {
    color = getColor(finiData?.background!, "medium")
  }

  return (
    <>
      <Head>
        {/* Hide the drag handles provided by application */}
        <style
          id="holderStyle"
          dangerouslySetInnerHTML={{
            __html: `
              .react-resizable-handle { opacity: 0 }
            `,
          }}/>
      </Head>
      <div className="w-full h-full flex items-center justify-items-center overflow-hidden" style={{ background: finiData?.background }}>
        <div className="h-full w-full m-auto flex relative" style={{ color: color }}>
          {finiData &&
            <>
              <div className="absolute inline-flex gap-2">
                <div>{finiData?.latestDelta.toFixed(2)}%</div>
                <div>${finiData?.latestPrice.toLocaleString()}</div>
                <div>{getAttributeFromFreshData(finiData!.attributes, 'Family')}</div>
              </div>
              <div className="absolute h-[7px] w-[7px] border-r-2 border-b-2 bottom-1 right-1" style={{ borderColor: color }}/>
            </>
          }
          
          <img
              alt="Token Image"
              className="w-full h-full max-h-[600px] max-w-[600px] object-contain m-auto"
              src={finiData?.image}
            />
        </div>
      </div>
    </>
  )
}



const FiniFrame: NextPage = () => {
  // read finis from localstorage
  const [myTeam, updateMyTeam] = useLocalStorageValue('myTeam')
  // const tempIds = ["9402", "349", "827", "420", "999", "2392", "723", "724", "725", "726"]
  const columnCount = 4

  let defaultLayout = () => {
    // @ts-ignore
    return myTeam.map((id, i) => {
      console.log(id, i)
      return {
        x: i % columnCount,
        y: i,
        w: 1,
        h: 1,
        i: id
      };
    })
  }

  const [layout, updateLayout] = useLocalStorageValue('frameLayout')
  let windowSize = useCurrentSize()

  // this triggers a relayout
  React.useEffect(() => {
    window.dispatchEvent(new Event('resize')); 
  }, []);

  if (!myTeam) {
    return (
      <div>no team</div>
    )
  }
  return (
    // overflow-hidden
    <div className="h-screen w-screen">
      <ReactGridLayout
        className="layout"
        // @ts-ignore
        layout={layout ?? defaultLayout()}
        // layouts={layouts}
        // breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        // cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        cols={columnCount}
        // autoSize={true}
        rowHeight={windowSize.height / 2}
        margin={[0, 0]}
        isResizable={true}
        resizeHandles={['se']}
        onLayoutChange={(layout) => {
          updateLayout(layout)
        }}
        // isBounded={false}
      >
        {/* @ts-ignore */}
        {myTeam.map(id => {
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