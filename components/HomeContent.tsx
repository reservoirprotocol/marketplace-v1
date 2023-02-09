import { FC, ReactNode } from 'react'

type Props = {}

type PropTwo = {
  headline: string,
  body: string,
  className?: string
}

type PropThree = {
  className?: string,
  children: ReactNode,
}

const Copy: FC<PropTwo> = ({ headline, body, className }) => {
  return (
    <div className="m-auto">
      <div className={"max-w-md " + className}>
        <div className={"reservoir-h1 mb-6 leading-[60px] " + className}>
          {headline}
        </div>
        <div className="text-xl">
          {body}
        </div>
      </div>
    </div>
  )
}

const Module: FC<PropThree> = ({ className, children }) => {
  return (
    <div className={`flex max-w-[1300px] px-4 m-auto ${className} flex-col md:flex-row`}>
      {children}
    </div>
  )
}

const HomeContent: FC<Props> = () => {
  const featured = [
    'https://cdn.finiliar.com/neutral_short_hungry_stomach/MjQ4OARx84.gif?format=mp4',
    'https://cdn.finiliar.com/happy_short_huge_surprise/MTkzOARx89.gif?format=mp4',
    'https://cdn.finiliar.com/sad_short_angry/MTc2MARx07.gif?format=mp4',
    'https://cdn.finiliar.com/neutral_short_dance/OTI5MgRx22.gif?format=mp4',
    'https://cdn.finiliar.com/neutral_short_scratching_head/OTU1MwRx35.gif?format=mp4',
    'https://cdn.finiliar.com/neutral_short_idle/NzcxNgRx67.gif?format=mp4',
    'https://cdn.finiliar.com/happy_short_dancing_with_stars/MDIzNQRx52.gif?format=mp4',
    'https://cdn.finiliar.com/neutral_short_eating/MjM1MARx03.gif?format=mp4',
    'https://cdn.finiliar.com/neutral_short_bored/NDU0MwRx35.gif?format=mp4',
    'https://cdn.finiliar.com/neutral_short_walk/NDA3NARx40.gif?format=mp4',
    'https://cdn.finiliar.com/neutral_short_eating/ODc2OQRx97.gif?format=mp4'
  ]
  return (
    <div className="pb-11 mb-11 overflow-x-hidden w-[100vw] max-w-[100%] col-span-full bg-[#fff5f3]">
      <div className="bg-[#F8E6D0] pt-4">
        <Module
          className="justify-center text-center m-auto relative"> 
          <Copy className="text-[#FF4F4F]" headline='Meet the finiliar' body='The finiliar are digital friends that keep you up to date with the things you care about.' />
        </Module>
        <div className="flex ml-[-50px] mt-[100px] overflow-hidden">
          {featured.map(item => {
            return (
              <div key={item}>
                <video loop autoPlay muted playsInline className="rounded-xl max-w-[200px] mx-2">
                  <source src={item} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            )
          })}
        </div>
          <div className="md:hidden flex ml-[-100px] mt-[20px] overflow-hidden">
            {featured.map((item, index) => {
              if (index < 5) return null
              return (
                <div key={item}>
                  <img src={item} alt="Example fini" className="rounded-xl max-w-[200px] mx-2" />
                </div>
              )
            })}
          </div>
      </div>
      <div style={{ background: 'linear-gradient(180deg, #F8E6D0 0%, #F4FFF7 40%, #F4FFF7 60%, #fff5f3 100%)' }}>
        <div className="pt-[200px] left-0 overflow-hidden relative">
          <Module className="mt-[100px] z-10 justify-around relative">
            <Copy className="text-[#7D7EF3]" headline='A recent discovery' body='The crypto market of 2021 gave rise to a new wave of finiliar that embody various crypto coins. Feeding on the data generated by these coins, the finiliar rejoice when prices are up and despair when they go down. You can own these finiliar as NFTs.' />
            <img
              className="max-w-[500px] w-full my-10 m-auto md:my-0 md:ml-16 rounded-[17px] bg-[transparent]" 
              src="https://cdn.finiliar.com/website/Mushroom.gif" alt="Example fini" />
          </Module>
          <img
            src="https://cdn.finiliar.com/website/graph.png"
            className="absolute w-[100vw] left-0 right-0 mt-[-400px] min-w-[800px]" alt="Graph background"
          />
        </div>
      </div>
      <div className="pb-[200px] md:pt-[75px] left-0 z-20 relative m-auto" style={{ background: 'linear-gradient(180deg, #e5ffed 0%, #e5ffed 70%, #fff5f3 100%)' }}>
        <Module className="pt-[200px] z-9 justify-around flex-col-reverse md:flex-row">
          <img
            className="max-w-[600px] mt-[45px] md:mr-[50px] md:w-[50%]" 
            src="https://cdn.finiliar.com/website/island.png" alt="Fini island" />
          <Copy className="text-[#A17235]" headline='Origins' body='The first finiliar were discovered in 2016 by a researcher named Ed Fornieles. Strange code turned out to be a new, adorable species of being. Ed has presented his research around the world as videos and sculptures.' />
        </Module>
      </div>
      <div className="left-0 mb-[150px] mt-[100px]">
        <Module className="z-9 justify-around">
          <Copy className="text-[#B980A5]" headline='Coming soon' body='Use your iPhone and Apple Watch to save your friends and track your crypto portfolio.' />
          <img
            className="max-w-[300px] m-auto mt-[50px] md:mr-[50px] md:w-[50%]" 
            src="https://cdn.finiliar.com/website/watch.png" alt="Fini watch app" />
        </Module>
      </div>
    </div>
  )
}

export default HomeContent
