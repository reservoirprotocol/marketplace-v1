import { FC, Fragment } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import Link from 'next/link'

const InfoModal: FC = () => {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className="hidden hover:underline sm:grid">
          What is reservoir.market?
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="absolute inset-0 h-screen backdrop-blur-sm">
          <Dialog.Content className="fixed top-1/2 left-1/2 max-w-prose -translate-x-1/2 -translate-y-1/2 transform rounded-md bg-white p-6 shadow-md">
            <Dialog.Close asChild>
              <button className="btn-neutral-ghost ml-auto mb-3 p-1.5">
                Close
              </button>
            </Dialog.Close>
            <div className="space-y-3">
              <section>
                <strong className="text-lg">What is Reservoir?</strong>
                <p className="mb-1">
                  Reservoir is a web3-native NFT order book protocol and
                  framework powering marketplaces and tools all sharing a global
                  pool of liquidity.
                </p>

                <Link href="https://reservoirprotocol.github.io/">
                  <a
                    className="underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Learn more
                  </a>
                </Link>
              </section>

              <section>
                <strong className="text-lg">
                  What is this sample app for?
                </strong>
                <p>
                  This is a sample marketplace built to highlight some of the
                  functionality you can access immediately when building with
                  Reservoir.
                </p>
              </section>

              <section>
                <p className="mb-3">Check out some other examples below:</p>

                {[
                  {
                    title: 'General Marketplace',
                    href: 'https://reservoir.market/',
                  },
                  {
                    title: 'Bored Ape Yacht Club Collection Marketplace',
                    href: 'https://boredapeyachtclub.reservoir.market/',
                  },
                  {
                    title: 'BAYC Community Marketplace',
                    href: 'https://bayc.reservoir.market/',
                  },
                ].map(({ title, href }) => (
                  <Fragment key={title}>
                    <strong>{title}</strong>
                    <Link href={href}>
                      <a
                        className="mb-3 block underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {href}
                      </a>
                    </Link>
                  </Fragment>
                ))}
              </section>

              <p>
                <span>
                  All of our sample marketplaces are fully functional but we
                  also encourage developers to{' '}
                </span>
                <Link href="https://github.com/reservoirprotocol/sample-marketplace">
                  <a
                    className="underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    fork our GitHub repository here.
                  </a>
                </Link>
              </p>
            </div>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default InfoModal
