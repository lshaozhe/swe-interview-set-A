import { useQuery, useQueryClient } from '@tanstack/react-query'
import apiClient from '../api/client'
import { useAuth } from '../context/AuthContext'

interface AdminUser {
  id: number
  name: string
  email: string
  role: string
}

export default function AdminPage() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const { data } = useQuery({ queryKey: ['admin-users'], queryFn: () => apiClient.get<AdminUser[]>('/api/admin/users').then(r => r.data) })

  async function remove(id: number) {
    await apiClient.delete(`/api/admin/users/${id}`)
    qc.invalidateQueries({ queryKey: ['admin-users'] })
  }

  return (
    <div>
      <h1>Admin</h1>
      {user?.role === 'admin' && <p>You are an administrator.</p>}
      <ul>
        {data?.map(u => (
          <li key={u.id}>
            {u.name} ({u.email}) {user?.role === 'admin' && <button onClick={() => remove(u.id)}>Delete</button>}
          </li>
        ))}
      </ul>
    </div>
  )
}
