import { optimizeImage } from 'lib/optmizeImage'
import { FC } from 'react'

const envBannerImage = process.env.NEXT_PUBLIC_BANNER_IMAGE

type Props = {
  banner: string | undefined
}

const HeroBackground: FC<Props> = ({ banner, children }) => {
  const bannerImage = optimizeImage(envBannerImage || banner, 1500)
  const baseClasses = `relative z-0 flex flex-col items-center col-span-full w-full py-14`

  return bannerImage ? (
    <div
      className={`${baseClasses} bg-cover bg-center`}
      style={{ backgroundImage: `url(${bannerImage})` }}
    >
      {children}
      <div className="absolute inset-0 z-0 bg-backdrop backdrop-blur-[30px] dark:bg-dark-backdrop"></div>
    </div>
  ) : (
    <div className={`${baseClasses} bg-white dark:bg-black`}>{children}</div>
  )
}

export default HeroBackground
