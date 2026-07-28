import { useState, useEffect } from 'react'
import apiClient from '../api/client'

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
  }, [])

  return { reports, loading, error }
}

export default useReports
