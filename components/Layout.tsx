import { ComponentProps, FC, ReactNode } from 'react'
import { Toaster } from 'react-hot-toast'
import Navbar from './Navbar'
import NetworkWarning from './NetworkWarning'

type Props = {
  navbar: ComponentProps<typeof Navbar>,
  className?: string
  children: ReactNode
}

const Layout: FC<Props> = ({ children, navbar, className }) => {
  return (
    <>
      <Toaster
        position={'top-right'}
        containerStyle={{ zIndex: 100000000000 }}
      />
      <NetworkWarning />
      {/* NOTE: this can't have overflow-x-auto or it breaks the sticky Sidebar */}
      <main className={className + " mx-auto grid max-w-[2560px] grid-cols-4 gap-x-4 pb-4 md:grid-cols-8 lg:grid-cols-12 3xl:grid-cols-16 4xl:grid-cols-21"}>
        <Navbar {...navbar} />
        {children}
      </main>
    </>
  )
}

export default Layout
