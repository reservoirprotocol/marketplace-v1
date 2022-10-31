import { useAccount } from 'wagmi'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import Link from 'next/link';

const ListItemButton = () => {
  const account = useAccount()
  const { openConnectModal } = useConnectModal();

  if (account.address) {
    return (
      <Link href={`/address/${account.address}`}>
        <a className="btn-primary-outline px-4 ml-4 whitespace-nowrap border border-[#D4D4D4] bg-white text-black dark:border-[#525252] dark:bg-black dark:text-white dark:ring-[#525252] dark:focus:ring-4">
          List an Item
        </a>
      </Link>
    )
  }

  return (
    <button onClick={openConnectModal} type="button" className='btn-primary-outline px-4 ml-4 whitespace-nowrap border border-[#D4D4D4] bg-white text-black dark:border-[#525252] dark:bg-black dark:text-white dark:ring-[#525252] dark:focus:ring-4'>
      List an Item
    </button>
  )
}

export default ListItemButton
