import FormatEth from 'components/FormatEth'
import Link from 'next/link'
import { FC, useEffect } from 'react'

const CollectionActivityTable: FC = () => {
  const headings = ['Event', 'Item', 'Price', 'From', 'To', 'Time']

  useEffect(() => {}, [])

  return (
    <table className="md:col-start-2 md:col-end-[-2]">
      <thead>
        <tr className="text-left">
          {headings.map((name, i) => (
            <th
              key={i}
              className="te pt-8 pb-7 text-sm font-medium text-neutral-600"
            >
              {name}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Offer Sale</td>
          <td>
            <img src="https://placekitten.com/200/300" />
            #30
          </td>
          <td>
            <FormatEth amount={10} />
          </td>
          <td>
            <Link href={`/address/0x0CccD55A5Ac261Ea29136831eeaA93bfE07f5Db6`}>
              <a className="">0x0CccD55A5Ac261Ea29136831eeaA93bfE07f5Db6</a>
            </Link>
          </td>
          <td>
            <Link href={`/address/0x0CccD55A5Ac261Ea29136831eeaA93bfE07f5Db6`}>
              <a className="">0x0CccD55A5Ac261Ea29136831eeaA93bfE07f5Db6</a>
            </Link>
          </td>
          <td>12 minutes ago</td>
        </tr>
      </tbody>
    </table>
  )
}

export default CollectionActivityTable
