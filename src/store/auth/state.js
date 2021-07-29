import { Cookies } from 'quasar'

export default function () {
  return {
    // in backend SESSION_COOKIE_HTTPONLY = False
    authenticated: Cookies.get('vssid') || false,
    user: JSON.parse(localStorage.getItem('user') || '{}')
  }
}
