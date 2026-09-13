import axios from 'axios'

const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL
  if (typeof window !== 'undefined' && envUrl) {
    // Keep hostname consistent with the window (localhost vs 127.0.0.1) to avoid CORS preflight mismatches
    if (window.location.hostname === 'localhost' && envUrl.includes('127.0.0.1')) {
      return envUrl.replace('127.0.0.1', 'localhost')
    }
    if (window.location.hostname === '127.0.0.1' && envUrl.includes('localhost')) {
      return envUrl.replace('localhost', '127.0.0.1')
    }
    return envUrl
  }
  return envUrl || 'http://localhost:8000/api/v1'
}

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Request interceptor: inject Sanctum Bearer token if   available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ecart_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: handle 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ecart_token')
      localStorage.removeItem('ecart_user')
      // Optionally trigger auth state reset or redirect
    }
    return Promise.reject(error)
  }
)

export default api
