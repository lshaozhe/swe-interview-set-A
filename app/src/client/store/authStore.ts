const AUTH_KEY = 'auth_token'
const USER_KEY = 'auth_user'

export interface AuthUser {
  id: number
  name: string
  email: string
  role: string
  orgId: number
}

export const authStore = {
  setToken(token: string) {
    localStorage.setItem(AUTH_KEY, token)
  },

  getToken() {
    return localStorage.getItem(AUTH_KEY)
  },

  setUser(user: AuthUser) {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  },

  getUser(): AuthUser | null {
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
