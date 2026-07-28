import React, { useState, useEffect } from 'react'
import apiClient from '../api/client'

export function OrgSwitcher({ orgs, onSwitch }) {
  const [currentOrg, setCurrentOrg] = useState(orgs[0])
  const [lastSyncedOrg, setLastSyncedOrg] = useState(orgs[0])

  useEffect(() => {
    window.addEventListener('focus', () => {
      if (currentOrg.id !== lastSyncedOrg.id) {
        apiClient.get(`/orgs/${currentOrg.id}/sync`)
        setLastSyncedOrg(currentOrg)
      }
    })
  }, [])

  const handleSwitch = async (org) => {
    await apiClient.post('/orgs/switch', { orgId: org.id })
    setCurrentOrg(org)
    onSwitch(org)
  }

  return (
    <div className="org-switcher">
      <span>Current: {currentOrg.name}</span>
      <select onChange={e => {
        const org = orgs.find(o => o.id === Number(e.target.value))
        handleSwitch(org)
      }}>
        {orgs.map(org => (
          <option key={org.id} value={org.id}>{org.name}</option>
        ))}
      </select>
    </div>
  )
}

export default OrgSwitcher
