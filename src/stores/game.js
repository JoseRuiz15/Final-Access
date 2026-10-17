import { defineStore } from 'pinia'

export const useGameStore = defineStore('game', {
  state: () => ({
    vidas: 5,
    llaves: 0,
    enemigos: 0,
    selectedCharacterId: 'cosa1',
    nivelActual: 1,
    tutorialNivel1Visto: false,
  }),
})
