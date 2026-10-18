import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { profileApi } from '@/api/client'

export const useProfileStore = defineStore('profile', () => {
  const profile = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  const characterId = computed(() => profile.value?.characterId || null)
  const displayName = computed(() => profile.value?.displayName || '')
  const coins = computed(() => profile.value?.coins || 0)

  async function fetchProfile() {
    isLoading.value = true
    error.value = null
    try {
      const response = await profileApi.get()
      if (response.data.ok) {
        const data = response.data.profile || response.data
        profile.value = {
          ...data,
          characterId: data.characterId || data.equippedCharacterId || null,
          unlockedCharacters: response.data.unlockedCharacters || data.unlockedCharacters || [],
        }
      }
      return response.data
    } catch (err) {
      error.value = err.response?.data?.error || 'Error al cargar el perfil'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function updateProfile(data) {
    isLoading.value = true
    error.value = null
    try {
      const response = await profileApi.update(data)
      if (response.data.ok) {
        profile.value = { ...profile.value, ...response.data.profile }
      }
      return response.data
    } catch (err) {
      error.value = err.response?.data?.error || 'Error al actualizar el perfil'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function equipCharacter(characterId) {
    isLoading.value = true
    error.value = null
    try {
      const response = await profileApi.equipCharacter(characterId)
      if (response.data.ok) {
        profile.value = {
          ...profile.value,
          characterId: response.data.equippedCharacterId || characterId,
          equippedCharacterId: response.data.equippedCharacterId || characterId,
        }
      }
      return response.data
    } catch (err) {
      error.value = err.response?.data?.error || 'Error al equipar personaje'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  function setProfile(profileData) {
    profile.value = profileData
  }

  return {
    profile,
    isLoading,
    error,
    characterId,
    displayName,
    coins,
    fetchProfile,
    updateProfile,
    equipCharacter,
    clearError,
    setProfile,
  }
})
