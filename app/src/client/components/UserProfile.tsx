import { useState } from 'react'
import apiClient from '../api/client'

interface Profile {
  name: string
  email: string
  role: string
  orgName?: string
  avatarUrl?: string
}

export function UserProfile({ userId }: { userId: number | string }) {
  const [user, setUser] = useState<Profile | null>(null)

  apiClient.get(`/api/users/${userId}`).then(res => setUser(res.data))

  if (!user) return <div>Loading...</div>

  return (
    <div className="user-profile">
      <img src={user.avatarUrl} alt={user.name} />
      <h2>{user.name}</h2>
      <p>{user.email}</p>
      <p>Role: {user.role}</p>
      <p>Organisation: {user.orgName}</p>
    </div>
  )
}

export default UserProfile
