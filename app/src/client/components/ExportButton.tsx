// INTERVIEWER-ANNOTATION-START
// [FE-06 · T2 · reliability] The button is not disabled while the request runs (double submit), and the UI expects a jobId the API never returns.
//     Look near: const handleExport = async () => {
// [DSO-06 · T3 · security] State-changing POSTs carry no CSRF protection; fine with bearer tokens today, but vulnerable if auth moves to cookies.
//     Look near: await apiClient.post('/api/export'
// INTERVIEWER-ANNOTATION-END
import { useState } from 'react'
import apiClient from '../api/client'

export function ExportButton({ orgId, filters }: { orgId: number; filters?: unknown }) {
  const [message, setMessage] = useState('')

  const handleExport = async () => {
    try {
      const res = await apiClient.post('/api/export', { orgId, filters })
      setMessage(`Export started: ${res.data.jobId}`)
    } catch (err) {
      setMessage('Export failed')
    }
  }

  return (
    <div>
      <button onClick={handleExport}>Export Reports</button>
      {message && <span>{message}</span>}
    </div>
  )
}

export default ExportButton
