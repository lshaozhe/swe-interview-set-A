import React, { useState } from 'react'
import apiClient from '../api/client'

// [FE-T1] fetch called directly in the component body — not inside useEffect.
//         Re-fetches on every render, no cleanup, no loading/error state.
// [SA-T2] Data fetching logic mixed directly into the component.
//         Should be extracted to a custom hook or service layer.

export function UserProfile({ userId }) {
  const [user, setUser] = useState(null)

  // This runs on every render — not wrapped in useEffect
  apiClient.get(`/users/${userId}`)
    .then(res => setUser(res.data))

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
