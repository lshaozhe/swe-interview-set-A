import React, { useState } from 'react'
import apiClient from '../api/client'

// [FE-T2] Double-submit race condition — button not disabled during the request.
//         Clicking twice fires two simultaneous POST requests.
// [DSO-T2] No CSRF token sent with this state-mutating POST request.
//          If auth moves to cookies, this endpoint is CSRF-vulnerable.

export function ExportButton({ orgId, filters }) {
  const [message, setMessage] = useState('')

  const handleExport = async () => {
    // No loading state set — button stays enabled throughout
    try {
      const res = await apiClient.post('/export', { orgId, filters })
      setMessage(`Export started: ${res.data.jobId}`)
    } catch (err) {
      setMessage('Export failed')
    }
  }

  return (
    <div>
      <button onClick={handleExport}>
        Export Reports
      </button>
      {message && <span>{message}</span>}
    </div>
  )
}

export default ExportButton
