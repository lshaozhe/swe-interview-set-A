import React, { useState } from 'react'
import apiClient from '../api/client'

export function UserProfile({ userId }) {
  const [user, setUser] = useState(null)

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
