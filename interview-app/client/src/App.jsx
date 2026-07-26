import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Dashboard from './components/Dashboard'
import UserProfile from './components/UserProfile'
import LoginPage from './pages/LoginPage'
import AdminPage from './pages/AdminPage'

// [SA-T1] No Error Boundary — an uncaught error in any child component
//         propagates up and crashes the entire app, showing a blank screen.
//
// [SA-T1] No route guards — /admin and /dashboard are accessible without
//         checking authentication. An unauthenticated user can navigate
//         directly to these routes.

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* No auth check — accessible without logging in */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile/:userId" element={<UserProfile />} />
          <Route path="/admin" element={<AdminPage />} />

          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    // No ErrorBoundary wrapping the tree
  )
}

export default App
