import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api/client'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const pendingRegistration = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!user.value)

  async function register(data) {
    isLoading.value = true
    error.value = null
    try {
      const response = await authApi.register(data)
      pendingRegistration.value = {
        username: data.username,
        email: data.email,
        password: data.password,
      }
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || err.response?.data?.error || 'Error en el registro'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function verifyEmail(data) {
    isLoading.value = true
    error.value = null
    try {
      const response = await authApi.verifyEmail(data)
      if (response.data.ok && response.data.user) {
        user.value = response.data.user
        pendingRegistration.value = null
      }
      return response.data
    } catch (err) {
      error.value =
        err.response?.data?.message || err.response?.data?.error || 'Código de verificación inválido'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function login(data) {
    isLoading.value = true
    error.value = null
    try {
      const response = await authApi.login(data)
      if (response.data.ok && response.data.user) {
        user.value = response.data.user
      }
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || err.response?.data?.error || 'Credenciales inválidas'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    isLoading.value = true
    try {
      await authApi.logout()
      user.value = null
    } catch (err) {
      // Even if logout fails on server, clear local state
      user.value = null
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchMe() {
    isLoading.value = true
    try {
      const response = await authApi.me()
      if (response.data.ok && response.data.user) {
        user.value = response.data.user
        return response.data.user
      }
    } catch (err) {
      user.value = null
      throw err
    } finally {
      isLoading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  function setUser(userData) {
    user.value = userData
  }

  return {
    user,
    pendingRegistration,
    isLoading,
    error,
    isAuthenticated,
    register,
    verifyEmail,
    login,
    logout,
    fetchMe,
    clearError,
    setUser,
  }
})
