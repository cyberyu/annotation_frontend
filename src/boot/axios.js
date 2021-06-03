import axios from 'axios'
import Vue from 'vue'

axios.defaults.xsrfHeaderName = 'X-CSRFToken'
axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.withCredentials = true

if (process.env.PROD === true) {
  Vue.prototype.$hostname = window.location.origin + window.location.pathname
} else {
  Vue.prototype.$hostname = 'http://127.0.0.1:8000'
}

Vue.prototype.$axios = axios.create({
  baseURL: Vue.prototype.$hostname
})
