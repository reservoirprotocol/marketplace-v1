import { FC, PropsWithChildren } from 'react'

const Card: FC<PropsWithChildren> = ({ children }) => {
  return (
    <article className="col-span-full rounded-2xl border border-gray-300 bg-white p-6 dark:border-neutral-600 dark:bg-black">
      {children}
    </article>
  )
}

export default Card
