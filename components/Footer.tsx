import { FaTwitter, FaDiscord } from 'react-icons/fa'
import Link from 'next/link'

const FOOTER_ENABLED = process.env.NEXT_PUBLIC_FOOTER_ENABLED == 'true'

const Footer = () => {

  if (FOOTER_ENABLED)
    return (
      <footer className='col-span-full flex flex-col sm:flex-row justify-between items-center px-6 md:px-16 pb-12'>
        <div className='flex flex-row justify-between items-center gap-x-6 sm:gap-x-8 mb-6 sm:mb-0 text-xs sm:text-sm flex-wrap'>
          <Link href='https://reservoir.tools/'>
            <a className='' target="_blank" rel="noreferrer">
              About
            </a>
          </Link>
          <Link href='/privacy'>
            <a className='min-w-max' target="_blank" rel="noreferrer">
              Privacy Policy
            </a>
          </Link>
          <Link href='/terms'>
            <a className='min-w-max' target="_blank" rel="noreferrer">
              Terms of Conditions
            </a>
          </Link>
        </div>
        <div className='flex flex-row items-center gap-x-6'>
          <Link href='https://twitter.com/reservoir0x'>
            <a className='' target="_blank" rel="noreferrer">
              <FaTwitter className='h-[20px] w-[25px]' />
            </a>
          </Link>
          <Link href='https://discord.gg/j5K9fESNwh' className='ml-5'>
            <a className='' target="_blank" rel="noreferrer">
              <FaDiscord className='h-[19px] w-[25px]' />
            </a>
          </Link>

        </div>
      </footer>
    )

  return null
}

export default Footer