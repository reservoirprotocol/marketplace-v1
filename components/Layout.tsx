import { ComponentProps, FC } from 'react'
import { Toaster } from 'react-hot-toast'
import Footer from './Footer';
import Navbar from './Navbar'
import NetworkWarning from './NetworkWarning'

type Props = {
  navbar: ComponentProps<typeof Navbar>
}

const Layout: FC<Props> = ({ children, navbar }) => {
  return (
    <>
      <Toaster
        position={'top-right'}
        containerStyle={{ zIndex: 100000000000 }}
      />
      <NetworkWarning />
      <main className="mx-auto grid max-w-[2560px] grid-cols-4 gap-x-4 pb-4 md:grid-cols-8 lg:grid-cols-12 3xl:grid-cols-16 4xl:grid-cols-21 main-container">
        <Navbar {...navbar} />
        {children}
      </main>
      <Footer />
    </>
  )
}

export default Layout
