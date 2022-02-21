import { Actions, State } from 'interfaces/context'

const AppReducer = (state: State, action: Actions) => {
  switch (action.type) {
    case 'LOAD_AVATAR': {
      if (!action.payload) return state

      return { ...state, avatar: action.payload }
    }
    default:
      return state
  }
}
export default AppReducer
