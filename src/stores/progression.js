import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { progressionApi } from '@/api/client'

const MAX_PLAYABLE_LEVEL_ID = 3

export const useProgressionStore = defineStore('progression', () => {
  const gameProgress = ref(null)
  const levelProgress = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  const currentLevelId = computed(() => gameProgress.value?.currentLevelId || 1)
  const totalXp = computed(() => gameProgress.value?.totalXp || 0)
  const currentLevel = computed(() => gameProgress.value?.currentLevel || 1)
  const coins = computed(() => gameProgress.value?.coins || 0)

  function mergeLevelProgress(previous, incoming) {
    if (!previous) return incoming
    if (!incoming) return previous

    const bestTimes = [previous.bestTimeSec, incoming.bestTimeSec]
      .map(Number)
      .filter((time) => Number.isFinite(time) && time > 0)

    return {
      ...previous,
      ...incoming,
      completed: Boolean(previous.completed || incoming.completed),
      stars: Math.max(Number(previous.stars) || 0, Number(incoming.stars) || 0),
      bestTimeSec: bestTimes.length ? Math.min(...bestTimes) : null,
    }
  }

  function upsertLevelProgress(progress) {
    const index = levelProgress.value.findIndex((item) => item.levelId === progress.levelId)
    if (index === -1) {
      levelProgress.value.push(progress)
      return
    }

    levelProgress.value[index] = mergeLevelProgress(levelProgress.value[index], progress)
  }

  function mergeProgressList(incoming = []) {
    const playableIncoming = incoming.filter((item) => item.levelId <= MAX_PLAYABLE_LEVEL_ID)
    const serverIds = new Set(playableIncoming.map((item) => item.levelId))
    const merged = playableIncoming.map((item) => {
      const previous = levelProgress.value.find((progress) => progress.levelId === item.levelId)
      return mergeLevelProgress(previous, item)
    })

    levelProgress.value
      .filter((item) => item.levelId <= MAX_PLAYABLE_LEVEL_ID && !serverIds.has(item.levelId))
      .forEach((item) => merged.push(item))

    levelProgress.value = merged
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
      if (response.data.ok) {
        gameProgress.value = response.data.gameProgress
        mergeProgressList(response.data.levelProgress || [])
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

    // Refleja el mejor resultado inmediatamente para que el mapa no muestre una
    // puntuación antigua mientras termina la petición de guardado.
    const previous = levelProgress.value.find((item) => item.levelId === levelId)
    upsertLevelProgress(
      mergeLevelProgress(previous, {
        levelId,
        completed: true,
        stars: data.stars,
        bestTimeSec: data.timeSec,
      }),
    )

    try {
      const response = await progressionApi.completeLevel(levelId, data)
      if (response.data.ok) {
        gameProgress.value = response.data.gameProgress
        upsertLevelProgress(response.data.levelProgress)
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
