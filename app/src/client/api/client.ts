// INTERVIEWER-ANNOTATION-START
// [FE-11 · T2 · reliability] There is no timeout and no response interceptor: 401s and 500s are handled inconsistently by each caller, and nothing retries transient failures.
//     Look near: apiClient.interceptors.request.use
// [DSO-05 · T1 · security] The API base URL is hard-coded in the client and not HTTPS.
//     Look near: baseURL: 'http://api.teammetrics.internal:3000'
// INTERVIEWER-ANNOTATION-END
import axios from 'axios'
import authStore from '../store/authStore'

const apiClient = axios.create({
  baseURL: 'http://api.teammetrics.internal:3000',
  headers: {
    'Content-Type': 'application/json'
  }
})

apiClient.interceptors.request.use(config => {
  const token = authStore.getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default apiClient
