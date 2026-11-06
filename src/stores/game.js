import { defineStore } from 'pinia'

const CHARACTER_STORAGE_KEY = 'final-access-selected-character'
const DASH_UNLOCK_STORAGE_KEY = 'final-access-dash-unlocked'
const CHARACTER_IDS = ['cosa1', 'cosa2', 'cosa3']

function getSavedCharacterId() {
  if (typeof window === 'undefined') return 'cosa1'

  try {
    const savedId = window.localStorage.getItem(CHARACTER_STORAGE_KEY)
    return CHARACTER_IDS.includes(savedId) ? savedId : 'cosa1'
  } catch {
    // Si el navegador bloquea localStorage, el juego sigue funcionando con Cosa 1.
    return 'cosa1'
  }
}

function getSavedDashUnlock() {
  if (typeof window === 'undefined') return false

  try {
    return window.localStorage.getItem(DASH_UNLOCK_STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

export const useGameStore = defineStore('game', {
  state: () => ({
    vidas: 5,
    llaves: 0,
    llavesCorrectas: 0,
    enemigos: 0,
    selectedCharacterId: getSavedCharacterId(),
    dashUnlocked: getSavedDashUnlock(),
    nivelActual: 1,
    tutorialNivel1Visto: false,
    levelSummary: null,
  }),

  actions: {
    equipCharacter(id) {
      if (!CHARACTER_IDS.includes(id)) return

      this.selectedCharacterId = id

      try {
        // Guardamos solo el personaje equipado; el resto del estado de partida no persiste.
        window.localStorage.setItem(CHARACTER_STORAGE_KEY, id)
      } catch {
        // La selección sigue funcionando durante esta sesión aunque no se pueda guardar.
      }
    },
    unlockDash() {
      this.dashUnlocked = true
      try {
        window.localStorage.setItem(DASH_UNLOCK_STORAGE_KEY, 'true')
      } catch {
        // El dash queda disponible durante esta sesión aunque no se pueda guardar.
      }
    },
    setLevelSummary(summary) {
      this.levelSummary = summary
    },
    clearLevelSummary() {
      this.levelSummary = null
    },
  },
})
