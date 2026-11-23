import type { ReportRow } from '../hooks/useReports'

function Row({ report }: { report: ReportRow }) {
  return (
    <tr>
      <td>{report.id}</td>
      <td>{report.title}</td>
      <td>{report.status}</td>
      <td>{report.value}</td>
      <td>{report.createdAt}</td>
    </tr>
  )
}

export function ReportTable({ reports }: { reports: ReportRow[] }) {
  return (
    <div className="report-table-container">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Status</th>
            <th>Value</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {reports.map(r => (
            <Row key={r.id} report={r} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ReportTable
