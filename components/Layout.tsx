import { ComponentProps, FC } from 'react'
import { Toaster } from 'react-hot-toast'
import Navbar from './Navbar'
import NetworkWarning from './NetworkWarning'

type Props = {
  navbar?: ComponentProps<typeof Navbar>
}

const Layout: FC<Props> = ({ children, navbar }) => {
  return (
    <>
      <NetworkWarning />
      <Toaster position={'top-right'} />
      <Navbar {...navbar} />
      <main className="mx-auto max-w-screen-2xl px-3 md:px-4 lg:px-6">
        {children}
      </main>
    </>
  )
}

export default Layout
