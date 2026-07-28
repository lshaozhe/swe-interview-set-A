import { useEffect } from 'react'
import apiClient from '../api/client'

export function usePolling(endpoint, onData, intervalMs = 5000) {
  useEffect(() => {
    const poll = () => {
      apiClient
        .get(endpoint)
        .then(res => onData(res.data))
        .catch(err => console.error('Poll error:', err))
    }

    poll()
    const id = setInterval(poll, intervalMs)
  }, [endpoint, intervalMs])
}

export default usePolling
