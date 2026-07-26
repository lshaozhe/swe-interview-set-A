import React, { createContext, useContext, useState, useCallback } from 'react'
import authStore from '../store/authStore'
import apiClient from '../api/client'

// [SA-T2] AuthContext.Provider wraps the entire application at the root level.
//         Any auth state change — including silent token refreshes every 15 min —
//         triggers a re-render of every component that calls useAuth(),
//         including heavy data tables and charts. Context value is a new object
//         on every render, so all consumers re-render even when nothing changed.

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(authStore.getUser())
  const [token, setToken] = useState(authStore.getToken())

  const login = useCallback(async (email, password) => {
    const res = await apiClient.post('/auth/login', { email, password })
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
    const res = await apiClient.post('/auth/refresh')
    authStore.setToken(res.data.token)
    setToken(res.data.token) // triggers re-render of all consumers
  }, [])

  // New object created on every render — all consumers always re-render
  return (
    <AuthContext.Provider value={{ user, token, login, logout, refreshToken }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
