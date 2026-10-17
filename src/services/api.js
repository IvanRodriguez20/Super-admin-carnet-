import axios from 'axios'

export const TOKEN_KEY = 'sa_token'
export const USER_KEY  = 'sa_user'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000,
})

// El superadmin NO envía X-University-Slug: opera sobre toda la plataforma
// y elige la universidad por ID en cada endpoint de /superadmin.
api.interceptors.request.use(config => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res.data.data,
  err => {
    const message = err.response?.data?.message || 'Error de conexión con el servidor'
    if (err.response?.status === 401 && !err.config.url.includes('/login')) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      window.location.href = '/login'
    }
    return Promise.reject(new Error(message))
  }
)

export default api
