import { Action, State } from './types'

const Reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'CONNECT_WALLET':
      console.log('CONNECT WALLET')
      return { ...state, connectWallet: { open: action.payload } }
    default:
      return state
  }
}

export default Reducer
