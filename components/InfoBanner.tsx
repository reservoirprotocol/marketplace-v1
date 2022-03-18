import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { FiX } from 'react-icons/fi'
import InfoModal from './InfoModal'

const InfoBanner = () => {
  const [open, setOpen] = useState(true)
  const router = useRouter()

  if (open && router.pathname === '/') {
    return (
      <div
        style={{
          background: 'linear-gradient(97.55deg, #BD00FF 0%, #7000FF 100%)',
        }}
        className="flex min-h-[72px] items-center"
      >
        <div className="mx-auto flex w-full max-w-screen-2xl items-start gap-6  p-3 sm:py-4 md:items-center md:px-4 lg:px-6">
          <div className="grid flex-grow items-center justify-start gap-2 md:flex md:justify-center">
            <p className="reservoir-body text-white">
              Build your own NFT marketplace with reservoir.market.
            </p>
            <InfoModal />
          </div>
          <button onClick={() => setOpen(false)}>
            <FiX className="h-5 w-5 text-white" />
          </button>
        </div>
      </div>
    )
  }
  return null
}

export default InfoBanner
