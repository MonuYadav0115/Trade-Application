import axios from 'axios'

const API = axios.create({ baseURL: 'https://trade-application.onrender.com' })

// Attach JWT to every request automatically

API.interceptors.request.use(cfg => {
  const token = localStorage.getItem('trade_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

// Auth
export const loginAPI = (username, password) =>
  API.post('/auth/login', { username, password })

// Analysis
export const analyzeSector = (sector) =>
  API.get(`/analyze/${sector}`)

// Session 
export const getSessionInfo = () =>
  API.get('/session/info')

// Health 
export const getHealth = () =>
  API.get('/health')

export default API