// INTERVIEWER-ANNOTATION-START
// [FE-09 · T2 · correctness] filters are missing from the effect dependencies, so the data never refetches when filters change.
//     Look near: }, [])
// [FE-10 · T3 · correctness] No AbortController: fast filter changes race and the last response to arrive wins, not the last request sent.
//     Look near: params: filters
// INTERVIEWER-ANNOTATION-END
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
