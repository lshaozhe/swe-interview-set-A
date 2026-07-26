import axios from 'axios'
import authStore from '../store/authStore'

// [DSO-T1] API base URL hardcoded in source — breaks across environments
//          and leaks internal infrastructure details in the repository.
//
// [FE-T2]  No request timeout configured — requests can hang indefinitely,
//          leaving users staring at spinners with no feedback.
//          No global response interceptor — 401s and 500s are handled
//          inconsistently across every component that calls this client.

const apiClient = axios.create({
  baseURL: 'http://api.teammetrics.internal:3000',
  headers: {
    'Content-Type': 'application/json'
  }
  // Missing: timeout: 10000
})

// Attach JWT from localStorage on every request
apiClient.interceptors.request.use(config => {
  const token = authStore.getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// No response interceptor:
// - 401 doesn't redirect to login
// - 500 errors not centrally logged
// - No retry logic for transient failures

export default apiClient
