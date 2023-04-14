// import FiniFrameNoSSR from 'components/FiniFrameNoSSR'
import FiniFrame from 'components/FiniFrame'
import {
  NextPage
} from 'next'
import { useEffect, useState } from 'react'

const TokyoPage: NextPage = () => {
  const [channel, setChannel] = useState(0)
  const [opacity, setOpacity] = useState(1)
  const numberOfPages = 16

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
      }, 30000)
    }
  }, [channel])

  // listen to channel change and update opacity value
  useEffect(() => {
    setTimeout(() => {
      setOpacity(1)
    }, 500)
  }, [channel])

  let transition = opacity == 1 ? { opacity: opacity, transitionProperty: "opacity", transitionDuration: "0.5s" } : { opacity: opacity }
  return (
    <div className="bg-[#ffd9d3] absolute w-[100vw] h-[100vh]">
      <div style={transition}>
        {(channel == 0 || channel == 14) &&
        // Polygon five
          <div className="absolute w-[100vw] h-[100vh] z-[82] top-[0px]">
            <FiniFrame
              teamIds={["2343", "4948", "2175", "58", "8699"]}
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
                  i: "4948"
                }
              ]}
            />
          </div>
        }
        {channel == 1 &&
          <div className="absolute w-[100vw] h-[100vh] z-[99] top-[0px]">
            <video onEnded={() => {incrementChannel()}} autoPlay muted playsInline className="object-cover w-[100vw] h-[100vh]">
              <source src='https://cdn.finiliar.com/website/tokyo/hearts_1 (2).mp4' type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        }
        {(channel == 2 || channel == 1) &&
        // solana four
          <div className="absolute w-[100vw] h-[100vh] z-[98] top-[0px]">
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
          </div>
        }
        {channel == 3 &&
          <div className="absolute w-[100vw] h-[100vh] z-[97] top-[0px]">
            <video onEnded={() => {incrementChannel()}} autoPlay muted playsInline className="object-cover w-[100vw] h-[100vh]">
              <source src='https://cdn.finiliar.com/website/tokyo/bad+frens+(1).mp4' type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        }
        {(channel == 4 || channel == 3) &&
        // dogecoin four
          <div className="absolute w-[100vw] h-[100vh] z-[96] top-[0px]">
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
          </div>
        }
        {(channel == 5 || channel == 4) &&
          // tezos five
          <div className="absolute w-[100vw] h-[100vh] z-[95] top-[0px]">
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
          </div>
        }
        {channel == 6 &&
          <div className="absolute w-[100vw] h-[100vh] z-[94] top-[0px]">
            <video onEnded={() => {incrementChannel()}} autoPlay muted playsInline className="object-cover w-[100vw] h-[100vh]">
              <source src='https://cdn.finiliar.com/website/tokyo/watch_1 (1).mp4' type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        }
        {(channel == 7 || channel == 6) &&
          // Avax five
          <div className="absolute w-[100vw] h-[100vh] z-[93] top-[0px]">
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
          </div>
        }
        {/* {channel == 8 &&
          <div className="absolute w-[100vw] h-[100vh] z-[92] top-[0px]">
            <video onEnded={() => {incrementChannel()}} autoPlay muted playsInline className="object-cover w-[100vw] h-[100vh]">
              <source src='https://cdn.finiliar.com/website/tokyo/battles_2.mp4' type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        } */}
        {(channel == 8 || channel == 7) &&
          // uni four
          <div className="absolute w-[100vw] h-[100vh] z-[91] top-[0px]">
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
          </div>
        }
        {(channel == 9 || channel == 8) &&
          // Bitcoin five
          <div className="absolute w-[100vw] h-[100vh] z-[90] top-[0px]">
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
          </div>
        }
        {/* {channel == 11 &&
          <div className="absolute w-[100vw] h-[100vh] z-[89] top-[0px]">
            <video onEnded={() => {incrementChannel()}} autoPlay muted playsInline className="object-cover w-[100vw] h-[100vh]">
              <source src='https://cdn.finiliar.com/website/tokyo/rainbow_smallmp4.mp4' type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        } */}
        {(channel == 10 || channel == 9) &&
          // Chainlink four
          <div className="absolute w-[100vw] h-[100vh] z-[88] top-[0px]">
            <FiniFrame
              teamIds={["1905", "826", "955", "1562"]}
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
                  i: "826"
                },
                {
                  x: 0,
                  y: 2,
                  w: 2,
                  h: 2,
                  i: "955"
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
          </div>
        }
        {(channel == 11 || channel == 10) &&
          // ETH five
          <div className="absolute w-[100vw] h-[100vh] z-[87] top-[0px]">
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
          </div>
        }
        {channel == 12 &&
          <div className="absolute w-[100vw] h-[100vh] z-[87] top-[0px]">
            <video onEnded={() => {incrementChannel()}} autoPlay muted playsInline className="object-cover w-[100vw] h-[100vh]">
              <source src='https://cdn.finiliar.com/website/tokyo/fren.mp4' type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        }
        {(channel == 13 || channel == 12) &&
            // binance four
          <div className="absolute w-[100vw] h-[100vh] z-[86] top-[0px]">
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
          </div>
        }
        {channel == 14 &&
          <div className="absolute w-[100vw] h-[100vh] z-[85] top-[0px]">
            <video onEnded={() => {incrementChannel()}} autoPlay muted playsInline className="object-cover w-[100vw] h-[100vh]">
              <source src='https://cdn.finiliar.com/website/tokyo/discover+the+truth.mp4' type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        }
      </div>
    </div>
  )
}

export default TokyoPage