import axios from 'axios'
import Vue from 'vue'

if (process.env.PROD === true) {
  if (window.location.origin.includes('com')) {
    // ec2
    Vue.prototype.$hostname = window.location.origin
  } else {
    // domino
    Vue.prototype.$hostname = window.location.origin + window.location.pathname
  }
} else {
  Vue.prototype.$hostname = 'http://127.0.0.1:8000'
}

Vue.prototype.$axios = axios.create({
  baseURL: Vue.prototype.$hostname
})

Vue.prototype.$axios.defaults.xsrfHeaderName = 'X-CSRFToken'
Vue.prototype.$axios.defaults.xsrfCookieName = 'csrftoken'
Vue.prototype.$axios.defaults.withCredentials = true
