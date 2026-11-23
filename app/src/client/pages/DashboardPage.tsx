import { useAuth } from '../context/AuthContext'
import Dashboard from '../components/Dashboard'
import ExportButton from '../components/ExportButton'
import { useReports } from '../hooks/useReports'

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const { reports, loading, error } = useReports({ orgId: user?.orgId ?? 1 })

  if (loading) return <p>Loading…</p>
  if (error) return <p>{error}</p>

  return (
    <>
      <Dashboard user={user!} data={reports.data} theme="light" onLogout={logout} />
      <ExportButton orgId={user?.orgId ?? 1} />
    </>
  )
}
