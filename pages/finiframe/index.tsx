import dynamic from 'next/dynamic'

const DynamicComponentWithNoSSR = dynamic(() => import('../../components/FiniFrame'), {
  ssr: false
})

const FiniFrameNoSSR = () => <DynamicComponentWithNoSSR />

export default FiniFrameNoSSR