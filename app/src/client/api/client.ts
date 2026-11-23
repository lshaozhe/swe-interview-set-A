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
