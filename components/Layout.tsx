import Head from 'next/head'
import { ComponentProps, FC } from 'react'
import Navbar from './Navbar'
import NetworkWarning from './NetworkWarning'

type Props = {
  title: string
  navbar: ComponentProps<typeof Navbar>
}

const Layout: FC<Props> = ({ title, children, navbar }) => {
  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <NetworkWarning />
      <main className="container mx-auto px-3">
        <Navbar {...navbar} />
        {children}
      </main>
    </>
  )
}

export default Layout
