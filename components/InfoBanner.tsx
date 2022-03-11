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
          background: 'linear-gradient(97.55deg, #BD00FF 0%, #7000FF 100%);',
        }}
        className="fixed inset-x-0 top-[84px] flex min-h-[72px] items-center justify-center sm:top-20"
      >
        <div className="reservoir-body flex max-w-screen-xl items-start gap-6 px-4 py-4 text-white md:items-center md:py-3">
          <div className="grid flex-grow items-center justify-center gap-2 md:flex">
            <p className="hidden md:block">
              Reservoir.market is an open source marketplace designed to show
              how simple it is to build on top of Reservoir, a web3-native order
              book protocol.
            </p>
            <p className="block md:hidden">
              Build your own NFT marketplace with reservoir.market.
            </p>
            <InfoModal />
          </div>
          <button onClick={() => setOpen(false)}>
            <FiX className="h-5 w-5" />
          </button>
        </div>
      </div>
    )
  }
  return null
}

export default InfoBanner
