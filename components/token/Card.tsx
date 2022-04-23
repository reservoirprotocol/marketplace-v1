import { FC } from 'react'

const Card: FC = ({ children }) => {
  return (
    <article className="col-span-full rounded-2xl border border-gray-300 bg-white p-6">
      {children}
    </article>
  )
}

export default Card
