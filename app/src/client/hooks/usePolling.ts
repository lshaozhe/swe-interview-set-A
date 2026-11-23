// INTERVIEWER-ANNOTATION-START
// [FE-07 · T2 · reliability] The interval is never cleared, so each mount adds another timer and the app slows down over time; onData is missing from the dependencies.
//     Look near: setInterval(poll, intervalMs)
// INTERVIEWER-ANNOTATION-END
import { useEffect } from 'react'
import apiClient from '../api/client'

export function usePolling<T>(endpoint: string, onData: (data: T) => void, intervalMs = 5000) {
  useEffect(() => {
    const poll = () => {
      apiClient
        .get(endpoint)
        .then(res => onData(res.data))
        .catch(err => console.error('Poll error:', err))
    }

    poll()
    setInterval(poll, intervalMs)
  }, [endpoint, intervalMs])
}

export default usePolling
