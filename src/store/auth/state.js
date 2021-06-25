import { Cookies } from 'quasar'

export default function () {
  return {
    // in backend SESSION_COOKIE_HTTPONLY = False
    authenticated: Cookies.get('sessionid') || false,
    user: JSON.parse(localStorage.getItem('user') || '{}')
  }
}
