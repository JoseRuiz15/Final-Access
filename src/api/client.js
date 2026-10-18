import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for HttpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - optional: add any auth headers if needed
api.interceptors.request.use(
  (config) => {
    // Cookies are automatically sent with withCredentials: true
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - redirect to login
      // We don't redirect here to avoid loops, let the component/router handle it
    }
    return Promise.reject(error)
  }
)

// Auth endpoints
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  verifyEmail: (data) => api.post('/auth/verify-email', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
}

// Profile endpoints
export const profileApi = {
  get: () => api.get('/profile'),
  update: (data) => api.patch('/profile', data),
  equipCharacter: (characterId) => api.put('/profile/equip', { characterId }),
}

// Character endpoints
export const characterApi = {
  getCatalog: () => api.get('/characters'),
  getUnlocked: () => api.get('/profile'), // Returns profile with unlockedCharacters
  unlock: (characterId) => api.post(`/characters/${characterId}/unlock`),
  // equip uses profile endpoint
  equip: (characterId) => api.put('/profile/equip', { characterId }),
}

// Progression endpoints
export const progressionApi = {
  getProgress: () => api.get('/progress'),
  completeLevel: (levelId, data) => api.post(`/progress/${levelId}/complete`, data),
}

// Mission endpoints
export const missionApi = {
  getMissions: () => api.get('/missions'),
  claim: (missionId) => api.post(`/missions/${missionId}/claim`),
}

// Lobby endpoints
export const lobbyApi = {
  create: (data) => api.post('/lobbies', data),
  list: (params) => api.get('/lobbies', { params }),
  get: (code) => api.get(`/lobbies/${code}`),
  join: (code, data) => api.post(`/lobbies/${code}/join`, data),
  leave: (code) => api.delete(`/lobbies/${code}/leave`),
  setReady: (code, ready) => api.patch(`/lobbies/${code}/ready`, { ready }),
  start: (code) => api.post(`/lobbies/${code}/start`),
  cancel: (code) => api.post(`/lobbies/${code}/cancel`),
}
