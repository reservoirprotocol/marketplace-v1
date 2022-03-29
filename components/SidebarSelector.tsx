import React, { FC, useState } from 'react'
import { FiEdit, FiGrid, FiUploadCloud } from 'react-icons/fi'

const SidebarSelector: FC<{
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}> = ({ setOpen, open }) => {
  return (
    <nav className="fixed top-0 left-0 z-20 h-screen w-14 gap-4 overflow-y-auto bg-white p-4">
      <div className="grid justify-center gap-3">
        <FiEdit className="h-5 w-5" onClick={() => setOpen(!open)} />
        <FiGrid className="h-5 w-5" onClick={() => setOpen(!open)} />
        <FiUploadCloud className="h-5 w-5" onClick={() => setOpen(!open)} />
      </div>
    </nav>
  )
}

export default SidebarSelector
