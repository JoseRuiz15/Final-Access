import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { progressionApi } from '@/api/client'
import { useProfileStore } from '@/stores/profile'

const MAX_PLAYABLE_LEVEL_ID = 5

export const useProgressionStore = defineStore('progression', () => {
  const profileStore = useProfileStore()
  const gameProgress = ref(null)
  const levelProgress = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  const currentLevelId = computed(() => gameProgress.value?.currentLevelId || 1)
  const totalXp = computed(() => gameProgress.value?.totalXp || 0)
  const currentLevel = computed(() => gameProgress.value?.currentLevel || 1)
  const coins = computed(() => profileStore.coins)

  function upsertLevelProgress(progress) {
    levelProgress.value = [
      ...levelProgress.value.filter((item) => item.levelId !== progress.levelId),
      progress,
    ].sort((a, b) => a.levelId - b.levelId)
  }

  function mergeProgressList(incoming = []) {
    levelProgress.value = incoming
      .filter((item) => Number(item.levelId) <= MAX_PLAYABLE_LEVEL_ID)
      .map((item) => ({ ...item, levelId: Number(item.levelId) }))
      .sort((a, b) => a.levelId - b.levelId)
  }

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
      if (!response.data?.ok) {
        throw new Error(response.data?.error || 'El servidor no pudo cargar el progreso.')
      }

      gameProgress.value = response.data.gameProgress
      mergeProgressList(response.data.levelProgress || [])
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
      if (!response.data?.ok || !response.data.levelProgress) {
        throw new Error(response.data?.error || 'El servidor no confirmó el progreso.')
      }

      gameProgress.value = response.data.gameProgress
      upsertLevelProgress(response.data.levelProgress)
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
    mergeProgressList(data.levelProgress || [])
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
