// INTERVIEWER-ANNOTATION-START
// [SA-03 · T2 · performance] The context value is a new object every render, so every consumer re-renders on any auth change.
//     Look near: value={{ user, token, login, logout, refreshToken }}
// INTERVIEWER-ANNOTATION-END
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import apiClient from '../api/client'
import authStore, { type AuthUser } from '../store/authStore'

interface AuthValue {
  user: AuthUser | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<void>
}

const AuthContext = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState(authStore.getUser())
  const [token, setToken] = useState(authStore.getToken())

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiClient.post('/api/auth/login', { email, password })
    authStore.setToken(res.data.token)
    authStore.setUser(res.data.user)
    setToken(res.data.token)
    setUser(res.data.user)
  }, [])

  const logout = useCallback(() => {
    authStore.clear()
    setToken(null)
    setUser(null)
  }, [])

  const refreshToken = useCallback(async () => {
    const res = await apiClient.post('/api/auth/refresh')
    authStore.setToken(res.data.token)
    setToken(res.data.token)
  }, [])

  return <AuthContext.Provider value={{ user, token, login, logout, refreshToken }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)!
}
