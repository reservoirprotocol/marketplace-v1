import dynamic from 'next/dynamic'

const DynamicComponentWithNoSSR = dynamic(() => import('./FiniFrame'), {
  ssr: false
})

const FiniFrameNoSSR = () => <DynamicComponentWithNoSSR />

export default FiniFrameNoSSR