import { useEffect, useState } from 'react'
import apiClient from '../api/client'

export interface ReportRow {
  id: number
  title: string
  status: string
  value: string
  createdAt: string
}

export function useReports(filters: { orgId: number; status?: string }) {
  const [reports, setReports] = useState<{ data: ReportRow[]; total: number }>({ data: [], total: 0 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    apiClient
      .get('/api/reports', { params: filters })
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
