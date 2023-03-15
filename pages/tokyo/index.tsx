// import FiniFrameNoSSR from 'components/FiniFrameNoSSR'
import FiniFrame from 'components/FiniFrame'
import {
  NextPage
} from 'next'
import { useEffect, useState } from 'react'

const TokyoPage: NextPage = () => {
  const [channel, setChannel] = useState(0)
  const numberOfPages = 6

  const incrementChannel = () => {
    let newChannel
    if (channel == numberOfPages) {
      newChannel = 0
    } else {
      newChannel = channel + 1
    }
    setChannel(newChannel)
  }

  useEffect(() => {
    if (channel == 0 || channel == 2 || channel == 4) {
      setTimeout(() => {
        incrementChannel()
      }, 10000)
    }
  }, [channel])

  return (
    <div>
      {channel == 0 &&
        <FiniFrame
          teamIds={["0", "1", "2", "3", "4"]}
          layoutOverride={[
            {
              x: 0,
              y: 0,
              w: 1,
              h: 4,
              i: "0"
            },
            {
              x: 1,
              y: 0,
              w: 1,
              h: 4,
              i: "1"
            },
            {
              x: 2,
              y: 0,
              w: 1,
              h: 4,
              i: "2"
            },
            {
              x: 3,
              y: 0,
              w: 1,
              h: 4,
              i: "3"
            },
            {
              x: 4,
              y: 0,
              w: 1,
              h: 4,
              i: "4"
            }
          ]}
        />
      }
      {channel == 1 &&
        <div
          style={{ width: "100vw", height: "100vh"}}
        >
          <video onEnded={() => {incrementChannel()}} autoPlay muted playsInline className="object-cover w-[100vw] h-[100vh]">
            <source src='https://cdn.finiliar.com/website/tokyo/hearts_1.mp4' type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      }
      {channel == 2 &&
        <FiniFrame
          teamIds={["5"]}
          layoutOverride={[
            {
              x: 0,
              y: 0,
              w: 5,
              h: 4,
              i: "5"
            }
          ]}
        />
      }
      {channel == 3 &&
        <div
          style={{ width: "100vw", height: "100vh"}}
        >
          <video onEnded={() => {incrementChannel()}} autoPlay muted playsInline className="object-cover w-[100vw] h-[100vh]">
            <source src='https://cdn.finiliar.com/website/tokyo/bad frens.mp4' type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      }
      {channel == 4 &&
        <FiniFrame
          teamIds={["5", "6", "7", "8"]}
          columnOverride={4}
          layoutOverride={[
            {
              x: 0,
              y: 0,
              w: 2,
              h: 2,
              i: "5"
            },
            {
              x: 2,
              y: 0,
              w: 2,
              h: 2,
              i: "6"
            },
            {
              x: 0,
              y: 2,
              w: 2,
              h: 2,
              i: "7"
            },
            {
              x: 2,
              y: 2,
              w: 2,
              h: 2,
              i: "8"
            }
          ]}
        />
      }
      {channel == 5 &&
        <div
          style={{ width: "100vw", height: "100vh"}}
        >
          <video onEnded={() => {incrementChannel()}} autoPlay muted playsInline className="object-cover w-[100vw] h-[100vh]">
            <source src='https://cdn.finiliar.com/website/tokyo/watch_1.mp4' type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      }
      {channel == 6 &&
        <div
          style={{ width: "100vw", height: "100vh"}}
        >
          <video onEnded={() => {incrementChannel()}} autoPlay muted playsInline className="object-cover w-[100vw] h-[100vh]" onEnded={() => incrementChannel()}>
            <source src='https://cdn.finiliar.com/website/tokyo/battles_1.mp4' type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      }
      {/* {channel == 6 &&
        <div
          style={{ width: "100vw", height: "100vh"}}
        >
          <video loop autoPlay muted playsInline className="object-cover w-[100vw] h-[100vh]">
            <source src='https://cdn.finiliar.com/website/tokyo/rainbow.mp4' type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      } */}
    </div>
  )
}

export default TokyoPage