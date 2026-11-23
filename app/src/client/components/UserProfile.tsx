// INTERVIEWER-ANNOTATION-START
// [FE-05 · T1 · correctness] The request is made in the component body, not an effect: it fires on every render, loops with setState, and has no error state or cleanup.
//     Look near: apiClient.get(`/api/users/${userId}`)
// [SA-04 · T2 · maintainability] Data fetching is mixed into the component instead of a hook or service.
//     Look near: useState<Profile | null>(null)
// INTERVIEWER-ANNOTATION-END
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
