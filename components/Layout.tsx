import { ComponentProps, FC } from 'react'
import Navbar from './Navbar'
import NetworkWarning from './NetworkWarning'

type Props = ComponentProps<typeof Navbar>

const Layout: FC<Props> = ({ children, title, image, collection }) => {
  return (
    <>
      <NetworkWarning />
      <main className="container mx-auto px-2 pt-4">
        <Navbar collection={collection} title={title} image={image} />
        {children}
      </main>
    </>
  )
}

export default Layout
