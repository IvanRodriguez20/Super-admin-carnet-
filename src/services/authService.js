import api from './api'

export const authService = {
  login: (document, password) => api.post('/auth/superadmin/login', { document, password }),
  changePassword: (newPassword) => api.put('/auth/change-password', { newPassword }),
}
