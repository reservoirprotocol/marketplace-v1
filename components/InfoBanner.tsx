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
        className="reservoir-body hidden min-h-[72px] w-full items-center px-4 py-3 text-white lg:flex"
      >
        <div className="flex flex-grow items-center justify-center gap-2">
          Reservoir.market is an open source marketplace designed to show how
          simple it is to build on top of Reservoir, a web3-native order book
          protocol.
          <InfoModal />
        </div>
        <button onClick={() => setOpen(false)}>
          <FiX className="h-5 w-5" />
        </button>
      </div>
    )
  }
  return null
}

export default InfoBanner
