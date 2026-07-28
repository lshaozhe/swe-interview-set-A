import React, { createContext, useContext, useState, useCallback } from 'react'
import authStore from '../store/authStore'
import apiClient from '../api/client'

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
    setToken(res.data.token)
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, login, logout, refreshToken }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
