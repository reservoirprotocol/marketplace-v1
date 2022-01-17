import { FC } from 'react'
import Navbar from './Navbar'

const Layout: FC = ({ children }) => {
  return (
    <main className="container mx-auto pt-4">
      <Navbar />
      {children}
    </main>
  )
}

export default Layout
