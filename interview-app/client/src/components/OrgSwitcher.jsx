import React, { useState, useEffect } from 'react'
import apiClient from '../api/client'

// [FE-T3] Stale closure — the window 'focus' event listener captures the
//         initial value of `currentOrg` and never updates, even as the user
//         switches orgs. This causes the wrong org's data to be refetched
//         when the user tabs back into the window.

export function OrgSwitcher({ orgs, onSwitch }) {
  const [currentOrg, setCurrentOrg] = useState(orgs[0])
  const [lastSyncedOrg, setLastSyncedOrg] = useState(orgs[0])

  useEffect(() => {
    // Listener added once — closes over the initial value of `currentOrg`
    window.addEventListener('focus', () => {
      // currentOrg here is always the value from the first render
      if (currentOrg.id !== lastSyncedOrg.id) {
        apiClient.get(`/orgs/${currentOrg.id}/sync`)
        setLastSyncedOrg(currentOrg)
      }
    })
    // No cleanup, no dependency array — listener stacks up on every render
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
