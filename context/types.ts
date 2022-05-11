export type State = {
  connectWallet: {
    open: boolean
  }
}

export type Action = {
  type: 'CONNECT_WALLET'
  payload: boolean
}
// | {
//     type: 'TEST'
//     payload: string
//   }
