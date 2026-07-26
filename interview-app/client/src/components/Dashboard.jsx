import React, { useState } from 'react'
import ReportTable from './ReportTable'
import FilterBar from './FilterBar'
import StatsSummary from './StatsSummary'

// [FE-T1] No React.memo — re-renders whenever parent passes new theme/user
// [FE-T2] Filter state owned here instead of in FilterBar — every keystroke
//         re-renders the entire Dashboard including the heavy ReportTable

export function Dashboard({ user, data, theme, onLogout }) {
  const [filters, setFilters] = useState({ search: '', status: 'all' })

  // [FE-T1] Expensive calculation runs on every render — not memoized
  const totals = data.reduce((acc, r) => {
    acc.total += r.value
    acc.count += 1
    return acc
  }, { total: 0, count: 0 })

  const filtered = data.filter(r => {
    const matchSearch = r.title.toLowerCase().includes(filters.search.toLowerCase())
    const matchStatus = filters.status === 'all' || r.status === filters.status
    return matchSearch && matchStatus
  })

  return (
    <div className={`dashboard theme-${theme}`}>
      <header>
        <h1>Welcome, {user.name}</h1>
        <button onClick={onLogout}>Logout</button>
      </header>

      <StatsSummary totals={totals} />

      {/* FilterBar does not own its own state — Dashboard re-renders on every keystroke */}
      <FilterBar filters={filters} onChange={setFilters} />

      <ReportTable reports={filtered} />
    </div>
  )
}

export default Dashboard
