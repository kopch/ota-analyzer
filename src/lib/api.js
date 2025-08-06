import axios from 'axios'

// Create axios instance
const api = axios.create({
  baseURL: process.env.VITE_BACKEND_URL || 'https://ota-analyzer-backend.onrender.com',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
  }
}

// Projects API
export const projectsAPI = {
  getAll: () => api.get('/api/projects'),
  getById: (id) => api.get(`/api/projects/${id}`),
  create: (data) => api.post('/api/projects', data),
  update: (id, data) => api.put(`/api/projects/${id}`, data),
  delete: (id) => api.delete(`/api/projects/${id}`),
  triggerAnalysis: (id) => api.post(`/api/projects/${id}/analyze`),
  takeScreenshot: (url) => api.post('/api/screenshot', { url }),
  analyze: (data, type) => api.post('/api/analyze', { data, analysisType: type })
}

// Health check
export const healthAPI = {
  check: () => api.get('/health')
}

export default api 