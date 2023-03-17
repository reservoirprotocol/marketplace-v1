// import FiniFrameNoSSR from 'components/FiniFrameNoSSR'
import FiniFrame from 'components/FiniFrame'
import {
  NextPage
} from 'next'
import { useEffect, useState } from 'react'

const TokyoPage: NextPage = () => {
  const [channel, setChannel] = useState(0)
  const [opacity, setOpacity] = useState(1)
  const numberOfPages = 15

  const incrementChannel = () => {
    setOpacity(0)
    let newChannel
    if (channel == numberOfPages) {
      newChannel = 0
    } else {
      newChannel = channel + 1
    }
    setChannel(newChannel)
  }

  useEffect(() => {
    if (channel == 0 || channel == 2 || channel == 4 || channel == 5 || channel == 7 || channel == 9 || channel == 10 || channel == 12 || channel == 13 || channel == 15) {
      setTimeout(() => {
        incrementChannel()
      }, 20000)
    }
  }, [channel])

  // listen to channel change and update opacity value
  useEffect(() => {
    setTimeout(() => {
      setOpacity(1)
    }, 1000)
  }, [channel])

  let transition = opacity == 1 ? { opacity: opacity, transitionProperty: "opacity", transitionDuration: "0.5s" } : { opacity: opacity }
  return (
    <div style={transition}>
      {channel == 0 &&
      // Polygon five
        <FiniFrame
          teamIds={["2343", "9825", "2175", "58", "8699"]}
          layoutOverride={[
            {
              x: 0,
              y: 0,
              w: 1,
              h: 4,
              i: "2343"
            },
            {
              x: 1,
              y: 0,
              w: 1,
              h: 4,
              i: "8699"
            },
            {
              x: 2,
              y: 0,
              w: 1,
              h: 4,
              i: "2175"
            },
            {
              x: 3,
              y: 0,
              w: 1,
              h: 4,
              i: "58"
            },
            {
              x: 4,
              y: 0,
              w: 1,
              h: 4,
              i: "9825"
            }
          ]}
        />
      }
      {channel == 1 &&
        <div
          style={{ width: "100vw", height: "100vh"}}
        >
          <video onEnded={() => {incrementChannel()}} autoPlay muted playsInline className="object-cover w-[100vw] h-[100vh]">
            <source src='https://cdn.finiliar.com/website/tokyo/hearts_1 (2).mp4' type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      }
      {channel == 2 &&
      // solana four
        <FiniFrame
        teamIds={["7827", "5465", "6727", "157"]}
        columnOverride={4}
        layoutOverride={[
          {
            x: 0,
            y: 0,
            w: 2,
            h: 2,
            i: "7827"
          },
          {
            x: 2,
            y: 0,
            w: 2,
            h: 2,
            i: "5465"
          },
          {
            x: 0,
            y: 2,
            w: 2,
            h: 2,
            i: "6727"
          },
          {
            x: 2,
            y: 2,
            w: 2,
            h: 2,
            i: "157"
          }
        ]}
      />
      }
      {channel == 3 &&
        <div
          style={{ width: "100vw", height: "100vh"}}
        >
          <video onEnded={() => {incrementChannel()}} autoPlay muted playsInline className="object-cover w-[100vw] h-[100vh]">
            <source src='https://cdn.finiliar.com/website/tokyo/bad+frens__small.mp4' type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      }
      {channel == 4 &&
      // dogecoin four
        <FiniFrame
          teamIds={["942", "7683", "2647", "2735"]}
          columnOverride={4}
          layoutOverride={[
            {
              x: 0,
              y: 0,
              w: 2,
              h: 2,
              i: "942"
            },
            {
              x: 2,
              y: 0,
              w: 2,
              h: 2,
              i: "7683"
            },
            {
              x: 0,
              y: 2,
              w: 2,
              h: 2,
              i: "2647"
            },
            {
              x: 2,
              y: 2,
              w: 2,
              h: 2,
              i: "2735"
            }
          ]}
        />
      }
      {channel == 5 &&
      // tezos five
        <FiniFrame
          teamIds={["6264", "8892", "9720", "8079", "6795"]}
          layoutOverride={[
            {
              x: 0,
              y: 0,
              w: 1,
              h: 4,
              i: "6264"
            },
            {
              x: 1,
              y: 0,
              w: 1,
              h: 4,
              i: "8892"
            },
            {
              x: 2,
              y: 0,
              w: 1,
              h: 4,
              i: "9720"
            },
            {
              x: 3,
              y: 0,
              w: 1,
              h: 4,
              i: "8079"
            },
            {
              x: 4,
              y: 0,
              w: 1,
              h: 4,
              i: "6795"
            }
          ]}
        />
      }
      {channel == 6 &&
        <div
          style={{ width: "100vw", height: "100vh"}}
        >
          <video onEnded={() => {incrementChannel()}} autoPlay muted playsInline className="object-cover w-[100vw] h-[100vh]">
            <source src='https://cdn.finiliar.com/website/tokyo/watch_1 (1).mp4' type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      }
      {channel == 7 &&
      // Avax five
        <FiniFrame
          teamIds={["4041", "19", "169", "210", "276"]}
          layoutOverride={[
            {
              x: 0,
              y: 0,
              w: 1,
              h: 4,
              i: "4041"
            },
            {
              x: 1,
              y: 0,
              w: 1,
              h: 4,
              i: "19"
            },
            {
              x: 2,
              y: 0,
              w: 1,
              h: 4,
              i: "169"
            },
            {
              x: 3,
              y: 0,
              w: 1,
              h: 4,
              i: "210"
            },
            {
              x: 4,
              y: 0,
              w: 1,
              h: 4,
              i: "276"
            }
          ]}
        />
      }
      {channel == 8 &&
        <div
          style={{ width: "100vw", height: "100vh"}}
        >
          <video onEnded={() => {incrementChannel()}} autoPlay muted playsInline className="object-cover w-[100vw] h-[100vh]">
            <source src='https://cdn.finiliar.com/website/tokyo/battles_2.mp4' type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      }
      {channel == 9 &&
      // uni four
        <FiniFrame
          teamIds={["4396", "9995", "622", "3815"]}
          columnOverride={4}
          layoutOverride={[
            {
              x: 0,
              y: 0,
              w: 2,
              h: 2,
              i: "4396"
            },
            {
              x: 2,
              y: 0,
              w: 2,
              h: 2,
              i: "9995"
            },
            {
              x: 0,
              y: 2,
              w: 2,
              h: 2,
              i: "622"
            },
            {
              x: 2,
              y: 2,
              w: 2,
              h: 2,
              i: "3815"
            }
          ]}
        />
      }
      {channel == 10 &&
      // Bitcoin five
        <FiniFrame
          teamIds={["6800", "4596", "4643", "45", "80"]}
          layoutOverride={[
            {
              x: 0,
              y: 0,
              w: 1,
              h: 4,
              i: "6800"
            },
            {
              x: 1,
              y: 0,
              w: 1,
              h: 4,
              i: "4596"
            },
            {
              x: 2,
              y: 0,
              w: 1,
              h: 4,
              i: "4643"
            },
            {
              x: 3,
              y: 0,
              w: 1,
              h: 4,
              i: "45"
            },
            {
              x: 4,
              y: 0,
              w: 1,
              h: 4,
              i: "80"
            }
          ]}
        />
      }
      {channel == 11 &&
        <div
          style={{ width: "100vw", height: "100vh"}}
        >
          <video onEnded={() => {incrementChannel()}} autoPlay muted playsInline className="object-cover w-[100vw] h-[100vh]">
            <source src='https://cdn.finiliar.com/website/tokyo/rainbow_smallmp4.mp4' type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      }
      {channel == 12 &&
      // Chainlink four
        <FiniFrame
          teamIds={["1905", "0826", "0955", "1562"]}
          columnOverride={4}
          layoutOverride={[
            {
              x: 0,
              y: 0,
              w: 2,
              h: 2,
              i: "1905"
            },
            {
              x: 2,
              y: 0,
              w: 2,
              h: 2,
              i: "0826"
            },
            {
              x: 0,
              y: 2,
              w: 2,
              h: 2,
              i: "0955"
            },
            {
              x: 2,
              y: 2,
              w: 2,
              h: 2,
              i: "1562"
            }
          ]}
        />
      }
      {channel == 13 &&
      // ETH five
        <FiniFrame
          teamIds={["3510", "9133", "9279", "421", "4069"]}
          layoutOverride={[
            {
              x: 0,
              y: 0,
              w: 1,
              h: 4,
              i: "3510"
            },
            {
              x: 1,
              y: 0,
              w: 1,
              h: 4,
              i: "9133"
            },
            {
              x: 2,
              y: 0,
              w: 1,
              h: 4,
              i: "9279"
            },
            {
              x: 3,
              y: 0,
              w: 1,
              h: 4,
              i: "421"
            },
            {
              x: 4,
              y: 0,
              w: 1,
              h: 4,
              i: "4069"
            }
          ]}
        />
      }
      {channel == 14 &&
        <div
          style={{ width: "100vw", height: "100vh"}}
        >
          <video onEnded={() => {incrementChannel()}} autoPlay muted playsInline className="object-cover w-[100vw] h-[100vh]">
            <source src='https://cdn.finiliar.com/website/tokyo/fren.mp4' type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      }
      {channel == 15 &&
      // binance four
        <FiniFrame
          teamIds={["5857", "5320", "7067", "9953"]}
          columnOverride={4}
          layoutOverride={[
            {
              x: 0,
              y: 0,
              w: 2,
              h: 2,
              i: "5857"
            },
            {
              x: 2,
              y: 0,
              w: 2,
              h: 2,
              i: "5320"
            },
            {
              x: 0,
              y: 2,
              w: 2,
              h: 2,
              i: "7067"
            },
            {
              x: 2,
              y: 2,
              w: 2,
              h: 2,
              i: "9953"
            }
          ]}
        />
      }
    </div>
  )
}

export default TokyoPage