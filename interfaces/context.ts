import React from 'react'

export type GlobalContextType = {
  state: State
  dispatch: React.Dispatch<Actions>
}

export type State = {
  avatar?: string
}

export type Actions = {
  type: 'LOAD_AVATAR'
  payload: any
}
