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
