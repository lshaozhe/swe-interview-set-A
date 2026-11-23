// INTERVIEWER-ANNOTATION-START
// [SA-01 · T1 · reliability] There is no error boundary, so an uncaught error in any component blanks the whole app.
//     Look near: <AuthProvider>
// [SA-02 · T1 · security] No route guards: /admin and /dashboard render without checking authentication.
//     Look near: path="/admin"
// INTERVIEWER-ANNOTATION-END
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import UserProfile from './components/UserProfile'
import AdminPage from './pages/AdminPage'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import { useParams } from 'react-router-dom'

function ProfileRoute() {
  const { userId } = useParams()
  return <UserProfile userId={userId!} />
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile/:userId" element={<ProfileRoute />} />
          <Route path="/admin" element={<AdminPage />} />

          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
