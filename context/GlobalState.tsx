import { createContext, useReducer, FC } from 'react'
import Reducer from './Reducer'
import { Action, State } from './types'

const initialState: State = {
  connectWallet: {
    open: false,
  },
}

export const GlobalContext = createContext<{
  state: State
  dispatch: React.Dispatch<Action>
}>({
  state: initialState,
  dispatch: () => null,
})

export const GlobalProvider: FC = ({ children }) => {
  const [state, dispatch] = useReducer(Reducer, initialState)

  return (
    <GlobalContext.Provider value={{ state, dispatch }}>
      {children}
    </GlobalContext.Provider>
  )
}
