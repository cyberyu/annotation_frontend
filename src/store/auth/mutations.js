export function authRequest (state) {
  state.status = 'loading'
}

export function authSuccess (state, data) {
  state.status = 'success'
  state.authenticated = true
  state.user = data
}

export function authError (state) {
  state.status = 'error'
}

export function logout (state) {
  state.authenticated = false
  state.user = { pk: '', username: '' }
}

export function loading (state, trueOrFalse) {
  state.loading = trueOrFalse
}
