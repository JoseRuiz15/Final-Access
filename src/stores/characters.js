import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { characterApi } from '@/api/client'

export const useCharacterStore = defineStore('characters', () => {
  const catalog = ref([])
  const unlockedCharacters = ref([])
  const equippedCharacterId = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  const allCharacters = computed(() => {
    return catalog.value.map((char) => ({
      ...char,
      isUnlocked: char.unlockCost === 0 || unlockedCharacters.value.includes(char.id),
      isEquipped: char.id === equippedCharacterId.value,
    }))
  })

  const getCharacterById = (id) => allCharacters.value.find((c) => c.id === id)

  // Mapear campos del backend a los que espera el frontend
  function mapCharacter(char) {
    // Los retratos del perfil usan CapitalCase: Cosa1_perfil.webp
    const perfilName = char.id.charAt(0).toUpperCase() + char.id.slice(1)
    return {
      id: char.id,
      nombre: char.name,
      imagen: char.textureKey ? `/img/characters/${char.textureKey}.png` : `/img/characters/${char.id}.png`,
      perfil: `/img/profile/${perfilName}_perfil.webp`,
      habilidad: char.abilityName || 'Habilidad desconocida',
      descripcion: char.abilityDesc || 'Sin descripción disponible',
      unlockCost: char.unlockCost || 0,
      rarity: char.rarity,
      attackType: char.attackType,
      isActive: char.isActive,
    }
  }

  async function fetchCatalog() {
    isLoading.value = true
    error.value = null
    try {
      const response = await characterApi.getCatalog()
      if (response.data.ok) {
        catalog.value = response.data.characters.map(mapCharacter)
      }
      return response.data
    } catch (err) {
      error.value = err.response?.data?.error || 'Error al cargar el catálogo'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchUnlocked(profileData = null) {
    isLoading.value = true
    error.value = null
    try {
      // GET /profile returns the profile and unlocked characters in separate fields.
      const data = profileData || (await characterApi.getUnlocked()).data
      const profile = data.profile || data
      const unlocked = data.unlockedCharacters || profile.unlockedCharacters || []
      unlockedCharacters.value = unlocked
        .map((item) =>
          typeof item === 'string' ? item : item.characterId || item.id || item.character?.id
        )
        .filter(Boolean)
      equippedCharacterId.value =
        profile.equippedCharacterId || data.equippedCharacter?.id || profile.characterId || null
      return data
    } catch (err) {
      error.value =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Error al cargar personajes desbloqueados'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function autoUnlockFreeCharacters() {
    const freeChars = catalog.value.filter(c => c.unlockCost === 0 && !unlockedCharacters.value.includes(c.id))
    for (const char of freeChars) {
      try {
        await unlockCharacter(char.id)
      } catch (err) {
        // Si ya está desbloqueado (400 con mensaje específico), agregarlo localmente
        if (
          err.response?.status === 400 &&
          (err.response?.data?.message?.includes('desbloqueado') ||
            err.response?.data?.error?.includes('desbloqueado'))
        ) {
          if (!unlockedCharacters.value.includes(char.id)) {
            unlockedCharacters.value.push(char.id)
          }
          const c = catalog.value.find(ch => ch.id === char.id)
          if (c) c.isUnlocked = true
        } else {
          console.warn(`No se pudo desbloquear ${char.id}:`, err)
        }
      }
    }
  }

  async function unlockCharacter(characterId) {
    isLoading.value = true
    error.value = null
    try {
      const response = await characterApi.unlock(characterId)
      if (response.data.ok) {
        if (!unlockedCharacters.value.includes(characterId)) {
          unlockedCharacters.value.push(characterId)
        }
        // Update catalog
        const char = catalog.value.find((c) => c.id === characterId)
        if (char) char.isUnlocked = true
      }
      return response.data
    } catch (err) {
      error.value = err.response?.data?.error || 'Error al desbloquear personaje'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function equipCharacter(characterId) {
    isLoading.value = true
    error.value = null
    try {
      const response = await characterApi.equip(characterId)
      if (response.data.ok) {
        equippedCharacterId.value = characterId
        // Update catalog
        catalog.value.forEach((c) => {
          c.isEquipped = c.id === characterId
        })
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

  function setCatalog(data) {
    catalog.value = data
  }

  function setUnlocked(data) {
    unlockedCharacters.value = data
  }

  function setEquipped(id) {
    equippedCharacterId.value = id
  }

  return {
    catalog,
    unlockedCharacters,
    equippedCharacterId,
    isLoading,
    error,
    allCharacters,
    getCharacterById,
    fetchCatalog,
    fetchUnlocked,
    unlockCharacter,
    equipCharacter,
    autoUnlockFreeCharacters,
    clearError,
    setCatalog,
    setUnlocked,
    setEquipped,
  }
})
