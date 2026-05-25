import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
})

// Attach JWT token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('lc_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Redirect to login on 401
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('lc_token')
      localStorage.removeItem('lc_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  login:            (data) => api.post('/auth/login', data),
  registerClient:   (data) => api.post('/auth/register/client', data),
  registerLawyer:   (data) => api.post('/auth/register/lawyer', data),
  changePassword:   (data) => api.post('/auth/change-password', data),
  updateProfile:    (data) => api.patch('/auth/profile', data),
}

// ── Cases ─────────────────────────────────────────────────────────────────────
export const casesApi = {
  submit:        (formData)       => api.post('/cases', formData),           // multipart
  getMyCases:    ()               => api.get('/cases/my'),
  getTracker:    ()               => api.get('/cases/tracker'),
  getPending:    ()               => api.get('/cases/pending'),
  getActive:     ()               => api.get('/cases/active'),
  accept:        (caseId)         => api.post(`/cases/${caseId}/accept`),
  updateStatus:  (caseId, data)   => api.patch(`/cases/${caseId}/status`, data),
  getTimeline:   (caseId)         => api.get(`/cases/${caseId}/timeline`),
}

// ── Lawyers ───────────────────────────────────────────────────────────────────
export const lawyersApi = {
  search:        (params)         => api.get('/lawyers/search', { params }),
  getStats:      ()               => api.get('/lawyers/stats'),
  updateProfile: (data)           => api.patch('/lawyers/profile', data),
}

// ── Client actions ────────────────────────────────────────────────────────────
export const clientApi = {
  submitReview:    (data)         => api.post('/client/reviews', data),
  submitComplaint: (data)         => api.post('/client/complaints', data),
}

// ── Messages ──────────────────────────────────────────────────────────────────
export const messagesApi = {
  getChatList:   ()               => api.get('/messages/chats'),
  getMessages:   (caseId)         => api.get(`/messages/${caseId}`),
  sendMessage:   (caseId, fd)     => api.post(`/messages/${caseId}`, fd),     // multipart
}

// ── Notifications ─────────────────────────────────────────────────────────────
export const notifApi = {
  getAll:        ()               => api.get('/notifications'),
  markAllRead:   ()               => api.post('/notifications/read'),
}

// ── Admin ─────────────────────────────────────────────────────────────────────
export const adminApi = {
  getStats:      ()               => api.get('/admin/stats'),
  getLawyers:    ()               => api.get('/admin/lawyers'),
  action:        (data)           => api.post('/admin/lawyers/action', data),
  getComplaints: ()               => api.get('/admin/complaints'),
  updateComplaint:(id, data)      => api.patch(`/admin/complaints/${id}`, data),
  getLogs:       ()               => api.get('/admin/logs'),
}

// ── AI ────────────────────────────────────────────────────────────────────────
export const aiApi = {
  chat:          (data)           => api.post('/ai/support', data),
}

export default api
