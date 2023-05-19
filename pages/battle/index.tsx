import dynamic from 'next/dynamic'

const DynamicComponentWithNoSSR = dynamic(() => import('components/battles/BattlePage'), {
  ssr: false
})

const BattlePageNoSSR = () => <DynamicComponentWithNoSSR />

export default BattlePageNoSSR