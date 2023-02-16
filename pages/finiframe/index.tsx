import { NextPage } from 'next'
import React, {
  FC,
  useEffect,
  useState,
} from 'react'
import Link from 'next/link'
import { FiniliarMetadata } from 'lib/fetchFromFiniliar'
import { fetchMetaFromFiniliar } from 'lib/fetchFromFiniliar'
import RGL, { WidthProvider } from "react-grid-layout";
import { useCurrentSize } from 'hooks/useCurrentSize'
import getAttributeFromFreshData from 'lib/getAttributeFromFreshData'
import { useLocalStorageValue } from '@react-hookz/web'
import getColor from 'lib/getColor'
import Head from 'next/head'
import { Chart, Cog } from 'components/Icons'
import { useRouter } from 'next/router'
import primaryColors from 'colors'
import { Delta } from 'components/Delta'

const ReactGridLayout = WidthProvider(RGL);

type Props = {
  finiId: string,
  cancelClick: boolean,
  showData: boolean,
  showButtons: boolean
  myTeam: [string]
  updateMyTeam: any
}

const GridItem: FC<Props> = ({ finiId, cancelClick, showData, showButtons, myTeam, updateMyTeam }) => {
  const router = useRouter()
  const [ finiData, updateFiniData ] = useState<FiniliarMetadata>()
  // const [myTeam, updateMyTeam] = useLocalStorageValue('myTeam')

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

  let color: string
  if (finiData) {
    color = getColor(finiData?.background!, "medium")!
  } else {
    color = "#000000"
  }
  
  const removeFiniId = (finiId: string) => {
    let newTeam = [...myTeam]
    // @ts-ignore
    let index = newTeam.indexOf(finiId)
    // @ts-ignore
    newTeam.splice(index, 1)
    console.log(newTeam)
    updateMyTeam(newTeam)
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
      <div onClick={() => {
          if (cancelClick) return
          router.push(`/discover/${finiId}`)
        }}
        className="w-full h-full flex items-center justify-items-center overflow-hidden"
        style={{ background: finiData?.background }}
      >
        <div className="h-full w-full m-auto flex relative" style={{ color: color }}>
          {finiData && showData &&
            <div className="absolute inline-flex gap-2 justify-between w-full p-2">
              <div>{getAttributeFromFreshData(finiData!.attributes, 'Family')}</div>
              <div className="text-right">
                <Delta tokenData={finiData!} delta={finiData!.latestDelta} />
                <div className="text-xl">${finiData?.latestPrice.toLocaleString()}</div>
              </div>
            </div>
          }
          {showButtons &&
            <>
              <div className="absolute left-2 bottom-1" onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                removeFiniId(finiId)
              }}>Remove</div>
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
  const [shouldCancel, setShouldCancel] = useState(false)
  const [layout, updateLayout] = useLocalStorageValue('frameLayout')
  const [ showData, setShowData ] = useLocalStorageValue('showData', true)
  const [ showButtons, setShowButtons ] = useState(false)

  const buttonTimer = 5000

  let windowSize = useCurrentSize()

  const columnCount = 4

  let defaultLayout = () => {
    // @ts-ignore
    if (!myTeam || myTeam.length == 0) return
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

  // this triggers a relayout on first open, which seems required
  React.useEffect(() => {
    window.dispatchEvent(new Event('resize')); 
  }, []);

  // show buttons on scroll or on mouse move
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> = setTimeout(() => '', 1000);
    const onMove = () => {

      // skip if already true
      if (!showButtons) {
        setShowButtons(true)
      }
      // clear timeout if we've already got one
      if (timeout) {
        clearTimeout(timeout)
      }
      // set timeout
      timeout = setTimeout(() => {
        setShowButtons(false)
      }, buttonTimer)
    }
    // clean up code
    window.removeEventListener('scroll', onMove);
    window.removeEventListener('mousemove', onMove);
    // set up code
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('scroll', onMove, { passive: true });
  }, []);

  // @ts-ignore
  if (!myTeam || !myTeam.length || myTeam.length == 0) {
    return (
      <div>
        <div className="max-w-[500px] p-2 pt-[200px] m-auto text-center">
          <div className="reservoir-h2 pb-3">
            Welcome to FiniFrame!
          </div>
          <div>
            Just browse the <Link href='/discover'>website</Link>, tap the hearts to favorite the ones you like, and come back here to arrange them into a grid you can display on your desktop, wall, or TV.
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="h-screen w-screen relative">
      <div className="fixed right-0 z-20 p-2">
        {showButtons &&
          <div
            className="rounded-full items-center justify-items-center flex cursor-pointer drop-shadow-lg"
            style={{ width: 52, height: 52, background: "#FFFFFFDD"}}
            onClick={() => setShowData(!showData)}
          >
            <div className="m-auto">
              <Chart color={showData ? primaryColors.finiliar[700] : '#000000' } />
            </div>
          </div>
        }
      </div>
      <ReactGridLayout
        className="layout"
        // @ts-ignore
        layout={layout ?? defaultLayout()}
        // layouts={layouts}
        // breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        // cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        cols={columnCount}
        // autoSize={true}
        rowHeight={windowSize.height / 3}
        margin={[0, 0]}
        isResizable={true}
        resizeHandles={['se']}
        // @ts-ignore
        onLayoutChange={(layout) => {
          updateLayout(layout)
        }}
        onDragStop={() => {
          setTimeout(() => {
            setShouldCancel(false)
            console.log(shouldCancel)
          })
        }}
        onDrag={() => {
          setShouldCancel(true)
        }}
        // isBounded={false}
      >
        {/* @ts-ignore */}
        {myTeam && myTeam.map(id => {
          return (
            <div key={id} style={{ cursor: showButtons ? "pointer" : "none"}}>
              <GridItem
                // @ts-ignore
                myTeam={myTeam}
                updateMyTeam={updateMyTeam}
                finiId={id}
                cancelClick={shouldCancel}
                showData={showData}
                showButtons={showButtons} />
            </div>
          )
        })}
      </ReactGridLayout>
    </div>
  )
}

export default FiniFrame