// [DSO-T1] JWT stored in localStorage — readable by any JavaScript on the page.
//          An XSS vulnerability anywhere in the app (or a third-party script)
//          can steal the token and impersonate the user indefinitely.
//          Tokens should be stored in HttpOnly cookies set by the server.

const AUTH_KEY = 'auth_token'
const USER_KEY = 'auth_user'

export const authStore = {
  setToken(token) {
    localStorage.setItem(AUTH_KEY, token)
  },

  getToken() {
    return localStorage.getItem(AUTH_KEY)
  },

  setUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  },

  getUser() {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  },

  clear() {
    localStorage.removeItem(AUTH_KEY)
    localStorage.removeItem(USER_KEY)
  },

  isAuthenticated() {
    return !!this.getToken()
  }
}

export default authStore
