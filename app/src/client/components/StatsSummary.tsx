export function StatsSummary({ totals }: { totals: { total: number; count: number } }) {
  return (
    <div className="stats-summary">
      <div>Reports: {totals.count}</div>
      <div>Total value: {totals.total}</div>
    </div>
  )
}

export default StatsSummary
