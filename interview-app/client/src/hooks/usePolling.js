import { useEffect } from 'react'
import apiClient from '../api/client'

// [FE-T2] Memory leak — setInterval is never cleared when the component
//         that uses this hook unmounts. Each mount adds a new interval
//         without removing the previous one. The app slows down progressively.

export function usePolling(endpoint, onData, intervalMs = 5000) {
  useEffect(() => {
    const poll = () => {
      apiClient
        .get(endpoint)
        .then(res => onData(res.data))
        .catch(err => console.error('Poll error:', err))
    }

    poll() // immediate first call
    const id = setInterval(poll, intervalMs)

    // Missing cleanup: return () => clearInterval(id)
  }, [endpoint, intervalMs])
  // Note: onData is also missing from deps, but that's a secondary issue
}

export default usePolling
