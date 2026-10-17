import api from './api'

/** Convierte un objeto a FormData si trae un archivo (logo); si no, envía JSON. */
const toBody = (data) => {
  if (!(data.logo instanceof File)) {
    const { logo: _logo, ...rest } = data
    return rest
  }
  const fd = new FormData()
  Object.entries(data).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') fd.append(k, v)
  })
  return fd
}

export const superAdminService = {
  // Plataforma
  overview: () => api.get('/superadmin/overview'),

  // Universidades (CRUD existente en /universities)
  createUniversity: (data) => api.post('/universities', toBody(data)),
  updateUniversity: (id, data) => api.put(`/universities/${id}`, toBody(data)),
  toggleUniversity: (id) => api.patch(`/universities/${id}/toggle`),

  // Universidad individual
  universityDetail: (id) => api.get(`/superadmin/universities/${id}`),
  setPlan: (id, body) => api.patch(`/superadmin/universities/${id}/plan`, body),

  // Usuarios de una universidad
  listUsers: (id, params) => api.get(`/superadmin/universities/${id}/users`, { params }),
  createUser: (id, data) => api.post(`/superadmin/universities/${id}/users`, data),
  updateUser: (id, userId, data) => api.put(`/superadmin/universities/${id}/users/${userId}`, data),
  toggleUser: (id, userId) => api.patch(`/superadmin/universities/${id}/users/${userId}/toggle`),
  resetPassword: (id, userId) => api.patch(`/superadmin/universities/${id}/users/${userId}/reset-password`),
}
