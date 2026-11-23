// INTERVIEWER-ANNOTATION-START
// [FE-04 · T3 · correctness] The focus listener closes over the first value of currentOrg, is never removed and stacks up, so the wrong org's data is synced when the tab regains focus.
//     Look near: window.addEventListener('focus'
// INTERVIEWER-ANNOTATION-END
import { useEffect, useState } from 'react'
import apiClient from '../api/client'

interface Org {
  id: number
  name: string
}

export function OrgSwitcher({ orgs, onSwitch }: { orgs: Org[]; onSwitch: (org: Org) => void }) {
  const [currentOrg, setCurrentOrg] = useState(orgs[0])
  const [lastSyncedOrg, setLastSyncedOrg] = useState(orgs[0])

  useEffect(() => {
    window.addEventListener('focus', () => {
      if (currentOrg.id !== lastSyncedOrg.id) {
        apiClient.get(`/api/orgs/${currentOrg.id}/sync`)
        setLastSyncedOrg(currentOrg)
      }
    })
  }, [])

  const handleSwitch = async (org: Org) => {
    await apiClient.post('/api/orgs/switch', { orgId: org.id })
    setCurrentOrg(org)
    onSwitch(org)
  }

  return (
    <div className="org-switcher">
      <span>Current: {currentOrg.name}</span>
      <select
        onChange={e => {
          const org = orgs.find(o => o.id === Number(e.target.value))!
          handleSwitch(org)
        }}
      >
        {orgs.map(org => (
          <option key={org.id} value={org.id}>
            {org.name}
          </option>
        ))}
      </select>
    </div>
  )
}

export default OrgSwitcher
