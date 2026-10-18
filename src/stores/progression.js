import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { progressionApi } from '@/api/client'

export const useProgressionStore = defineStore('progression', () => {
  const gameProgress = ref(null)
  const levelProgress = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  const currentLevelId = computed(() => gameProgress.value?.currentLevelId || 1)
  const totalXp = computed(() => gameProgress.value?.totalXp || 0)
  const currentLevel = computed(() => gameProgress.value?.currentLevel || 1)
  const coins = computed(() => gameProgress.value?.coins || 0)

  const isLevelCompleted = (levelId) => {
    const progress = levelProgress.value.find((p) => p.levelId === levelId)
    return progress?.completed || false
  }

  const getLevelStars = (levelId) => {
    const progress = levelProgress.value.find((p) => p.levelId === levelId)
    return progress?.stars || 0
  }

  const getBestTime = (levelId) => {
    const progress = levelProgress.value.find((p) => p.levelId === levelId)
    return progress?.bestTimeSec || null
  }

  async function fetchProgress() {
    isLoading.value = true
    error.value = null
    try {
      const response = await progressionApi.getProgress()
      if (response.data.ok) {
        gameProgress.value = response.data.gameProgress
        levelProgress.value = response.data.levelProgress || []
      }
      return response.data
    } catch (err) {
      error.value = err.response?.data?.error || 'Error al cargar progreso'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function completeLevel(levelId, data) {
    isLoading.value = true
    error.value = null
    try {
      const response = await progressionApi.completeLevel(levelId, data)
      if (response.data.ok) {
        gameProgress.value = response.data.gameProgress
        // Update or add level progress
        const index = levelProgress.value.findIndex((p) => p.levelId === levelId)
        if (index >= 0) {
          levelProgress.value[index] = response.data.levelProgress
        } else {
          levelProgress.value.push(response.data.levelProgress)
        }
      }
      return response.data
    } catch (err) {
      error.value = err.response?.data?.error || 'Error al completar nivel'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  function setProgress(data) {
    gameProgress.value = data.gameProgress
    levelProgress.value = data.levelProgress || []
  }

  return {
    gameProgress,
    levelProgress,
    isLoading,
    error,
    currentLevelId,
    totalXp,
    currentLevel,
    coins,
    isLevelCompleted,
    getLevelStars,
    getBestTime,
    fetchProgress,
    completeLevel,
    clearError,
    setProgress,
  }
})