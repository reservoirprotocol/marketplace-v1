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
      <main className="container mx-auto px-3">
        <Navbar {...navbar} />
        {children}
      </main>
    </>
  )
}

export default Layout
