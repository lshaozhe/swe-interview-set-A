import { useState } from 'react'
import type { AuthUser } from '../store/authStore'
import FilterBar, { type Filters } from './FilterBar'
import ReportTable from './ReportTable'
import StatsSummary from './StatsSummary'
import type { ReportRow } from '../hooks/useReports'

interface Props {
  user: AuthUser
  data: ReportRow[]
  theme: string
  onLogout: () => void
}

export function Dashboard({ user, data, theme, onLogout }: Props) {
  const [filters, setFilters] = useState<Filters>({ search: '', status: 'all' })

  const totals = data.reduce(
    (acc, r) => {
      acc.total += Number(r.value.replace('$', ''))
      acc.count += 1
      return acc
    },
    { total: 0, count: 0 }
  )

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

      <FilterBar filters={filters} onChange={setFilters} />

      <ReportTable reports={filtered} />
    </div>
  )
}

export default Dashboard
