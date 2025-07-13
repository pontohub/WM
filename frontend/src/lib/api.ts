import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// API endpoints
export const endpoints = {
  // Auth
  login: '/api/auth/login',
  register: '/api/auth/register',
  logout: '/api/auth/logout',
  forgotPassword: '/api/auth/forgot-password',
  resetPassword: '/api/auth/reset-password',
  refreshToken: '/api/auth/refresh',
  
  // Users
  users: '/api/users',
  userProfile: '/api/users/profile',
  
  // Companies
  companies: '/api/companies',
  
  // Projects
  projects: '/api/projects',
  
  // Tasks
  tasks: '/api/tasks',
  
  // Time Entries
  timeEntries: '/api/time-entries',
  
  // Contracts
  contracts: '/api/contracts',
  
  // Invoices
  invoices: '/api/invoices',
  
  // Reports
  reports: '/api/reports',
}

export default api

