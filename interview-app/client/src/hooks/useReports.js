import { useState, useEffect } from 'react'
import apiClient from '../api/client'

// [FE-T2] Missing `filters` in the useEffect dependency array.
//         The fetch runs once on mount and never again when filters change.
//         Users see stale data after changing filter values.
//
// [FE-T3] No AbortController — if filters change rapidly, multiple in-flight
//         requests race each other. The last to resolve wins, which may not
//         be the most recent request. Users see wrong results intermittently.

export function useReports(filters) {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    apiClient
      .get('/reports', { params: filters })
      .then(res => {
        setReports(res.data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, []) // <-- filters missing from dependency array

  return { reports, loading, error }
}

export default useReports
