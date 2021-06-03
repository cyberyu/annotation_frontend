import { Cookies } from 'quasar'

export function register ({ commit }, user) {
  return new Promise((resolve, reject) => {
    commit('authRequest')
    this.$axios.post('/rest-auth/registration/', user)
      .then(resp => {
        // const token = resp.data.token
        const user = resp.data.user
        // localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        // this.$axios.defaults.headers.common['Authorization'] = 'JWT ' + token
        commit('authSuccess', resp.data)
        resolve(resp)
      })
      .catch(err => {
        commit('authError', err)
        // localStorage.removeItem('token')
        localStorage.removeItem('user')
        reject(err)
      })
  })
}

export function setCSRFToken ({ commit }) {
  return new Promise((resolve, reject) => {
    this._vm.$axios.get('/account/login-set-cookie/').then(resp => {
      if (resp.status === 200) {
        const token = Cookies.get('csrftoken')
        localStorage.setItem('csrftoken', token)
        commit('csrftoken', token)
        resolve(resp)
      }
    }).catch(err => {
      commit('auth_error')
      localStorage.removeItem('csrftoken')
      reject(err)
    })
  })
}

export function login ({ commit, dispatch }, user) {
  return new Promise((resolve, reject) => {
    commit('authRequest')
    this._vm.$axios.post('/account/login/', user)
      .then(resp => {
        if (resp.status === 200) {
          const user = resp.data
          localStorage.setItem('user', JSON.stringify(user))
          commit('authSuccess', resp.data)
          resolve(resp)
        }
      })
      .catch(err => {
        commit('authError')
        localStorage.removeItem('user')
        reject(err)
      })
  })
}

export function logout ({ commit }) {
  return new Promise((resolve) => {
    this.$axios.post('/rest-auth/logout/', {})
    commit('logout')
    // localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('csrftoken')
    // delete this.$axios.defaults.headers.common['Authorization']
    resolve()
  })
}
