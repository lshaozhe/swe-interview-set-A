export interface Filters {
  search: string
  status: string
}

export function FilterBar({ filters, onChange }: { filters: Filters; onChange: (f: Filters) => void }) {
  return (
    <div className="filter-bar">
      <input placeholder="Search reports" value={filters.search} onChange={e => onChange({ ...filters, search: e.target.value })} />
      <select value={filters.status} onChange={e => onChange({ ...filters, status: e.target.value })}>
        <option value="all">All</option>
        <option value="draft">Draft</option>
        <option value="published">Published</option>
        <option value="archived">Archived</option>
      </select>
    </div>
  )
}

export default FilterBar
