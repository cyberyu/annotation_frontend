import Vue from 'vue'
import axios from 'axios'

Vue.prototype.$axios = axios

if (process.env.PROD === true) {
  Vue.prototype.$hostname = window.location.origin + window.location.pathname
} else {
  Vue.prototype.$hostname = 'http://localhost:8000'
}
