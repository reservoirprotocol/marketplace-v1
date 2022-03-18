import { ComponentProps, FC } from 'react'
import { Toaster } from 'react-hot-toast'
import InfoBanner from './InfoBanner'
import Navbar from './Navbar'
import NetworkWarning from './NetworkWarning'

type Props = {
  navbar?: ComponentProps<typeof Navbar>
}

const Layout: FC<Props> = ({ children, navbar }) => {
  return (
    <>
      <Toaster position={'top-right'} />
      <NetworkWarning />
      <InfoBanner />
      <main className="mx-auto grid max-w-screen-2xl grid-cols-4 gap-4 px-3 pb-4 md:grid-cols-8 md:px-4 lg:grid-cols-12 lg:px-6">
        <Navbar {...navbar} />
        {children}
      </main>
    </>
  )
}

export default Layout
