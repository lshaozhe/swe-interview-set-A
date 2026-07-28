import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Dashboard from './components/Dashboard'
import UserProfile from './components/UserProfile'
import LoginPage from './pages/LoginPage'
import AdminPage from './pages/AdminPage'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile/:userId" element={<UserProfile />} />
          <Route path="/admin" element={<AdminPage />} />

          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
