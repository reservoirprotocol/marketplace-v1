import Head from 'next/head'
import { ComponentProps, FC } from 'react'
import Navbar from './Navbar'
import NetworkWarning from './NetworkWarning'

type Props = {
  navbar: ComponentProps<typeof Navbar>
}

const Layout: FC<Props> = ({ children, navbar }) => {
  return (
    <>
      <NetworkWarning />
      <main className="container mx-auto px-3">
        <Navbar {...navbar} />
        {children}
      </main>
    </>
  )
}

export default Layout
