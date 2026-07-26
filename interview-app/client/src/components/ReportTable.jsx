import React from 'react'

// [FE-T1] No virtualisation — all rows rendered into the DOM at once.
//         Works fine in dev with 50 rows; causes severe jank with 10k rows.

function ReportRow({ report }) {
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

export function ReportTable({ reports }) {
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
            <ReportRow key={r.id} report={r} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ReportTable
