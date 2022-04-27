import { formatNumber } from 'lib/numbers'
import { optimizeImage } from 'lib/optmizeImage'
import { FC, useEffect, useState } from 'react'
import { FiGlobe } from 'react-icons/fi'
import FormatEth from './FormatEth'

const envBannerImage = process.env.NEXT_PUBLIC_BANNER_IMAGE

type Props = {
  stats: {
    vol24: number | undefined
    count: number | undefined
    topOffer: number | undefined
    floor: number | undefined
  }
  header: {
    banner: string | undefined
    image: string | undefined
    name: string | undefined
  }
  social: {
    twitterUsername: unknown
    externalUrl: unknown
    discordUrl: unknown
  }
}

const Hero: FC<Props> = ({ stats, header, children, social }) => {
  const [delay, setDelay] = useState(true)
  useEffect(() => {
    setTimeout(() => setDelay(false), 1500)
  }, [])

  const bannerImage = optimizeImage(envBannerImage || header.banner, 1500)

  return (
    <>
      {bannerImage ? (
        <img
          src={bannerImage}
          alt={`${header.name} banner image`}
          height="200px"
          className="col-span-full h-[135px] w-full object-cover sm:h-[237px]"
        />
      ) : (
        <div
          className={`col-span-full h-[135px] w-full ${
            delay ? '' : 'bg-gradient-to-r from-violet-500 to-fuchsia-500'
          } sm:h-[237px]`}
        ></div>
      )}
      <div className="col-span-full grid gap-5 px-4 py-6 md:place-items-center md:py-11 md:px-16 lg:flex lg:items-center lg:justify-between">
        <div className="flex items-center">
          <img className="h-[70px] w-[70px] rounded-full" src={header.image} />
          <div className="ml-3  flex-grow ">
            <div className="grid items-center lg:flex lg:gap-4">
              <h1 className="reservoir-h4 dark:text-white">{header.name}</h1>
              <div className="flex gap-4">
                {typeof social.discordUrl === 'string' && (
                  <a
                    className="reservoir-h6 flex-none"
                    target="_blank"
                    rel="noopener noreferrer"
                    href={social.discordUrl}
                  >
                    <img
                      src="/icons/Discord.svg"
                      alt="Discord Icon"
                      className="h-6 w-6"
                    />
                  </a>
                )}
                {typeof social.twitterUsername === 'string' && (
                  <a
                    className="reservoir-h6 flex-none"
                    target="_blank"
                    rel="noopener noreferrer"
                    href={`https://twitter.com/${social.twitterUsername}`}
                  >
                    <img
                      src="/icons/Twitter.svg"
                      alt="Twitter Icon"
                      className="h-6 w-6"
                    />
                  </a>
                )}
                {typeof social.externalUrl === 'string' && (
                  <a
                    className="reservoir-h6 flex-none"
                    target="_blank"
                    rel="noopener noreferrer"
                    href={social.externalUrl}
                  >
                    <FiGlobe className="h-6 w-6" />
                  </a>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between gap-4">
              <Stat name="Top Offer">
                <FormatEth amount={stats.topOffer} maximumFractionDigits={4} />
              </Stat>
              <Stat name="Floor">
                <FormatEth amount={stats.floor} maximumFractionDigits={4} />
              </Stat>
              <Stat name="Items">{formatNumber(stats.count)}</Stat>
            </div>
          </div>
        </div>
        <div className="flex gap-4">{children}</div>
      </div>
    </>
  )
}

export default Hero

const Stat: FC<{ name: string }> = ({ name, children }) => (
  <div className="grid items-center sm:flex sm:gap-1">
    <div className="reservoir-h6 text-gray-400">{name}</div>
    <div className="reservoir-h6 dark:text-white">{children}</div>
  </div>
)
