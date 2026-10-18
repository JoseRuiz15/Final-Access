import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { missionApi } from '@/api/client'

export const useMissionStore = defineStore('missions', () => {
  const missions = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  const availableMissions = computed(() => missions.value.filter((m) => !m.claimed && m.currentProgress >= m.target))
  const claimedMissions = computed(() => missions.value.filter((m) => m.claimed))
  const pendingMissions = computed(() => missions.value.filter((m) => !m.claimed && m.currentProgress < m.target))

  async function fetchMissions() {
    isLoading.value = true
    error.value = null
    try {
      const response = await missionApi.getMissions()
      if (response.data.ok) {
        missions.value = response.data.missions || []
      }
      return response.data
    } catch (err) {
      error.value = err.response?.data?.error || 'Error al cargar misiones'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function claimMission(missionId) {
    isLoading.value = true
    error.value = null
    try {
      const response = await missionApi.claim(missionId)
      if (response.data.ok) {
        const mission = missions.value.find((m) => m.id === missionId)
        if (mission) {
          mission.claimed = true
          mission.claimedAt = new Date().toISOString()
        }
      }
      return response.data
    } catch (err) {
      error.value = err.response?.data?.error || 'Error al reclamar recompensa'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  function setMissions(data) {
    missions.value = data
  }

  return {
    missions,
    isLoading,
    error,
    availableMissions,
    claimedMissions,
    pendingMissions,
    fetchMissions,
    claimMission,
    clearError,
    setMissions,
  }
})