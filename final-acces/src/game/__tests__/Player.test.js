import { describe, it, vi } from 'vitest'

vi.mock('@/stores/game.js', () => ({
  useGameStore: () => ({ vidas: 5, llaves: 0, enemigos: 0 }),
}))

describe('Player (logic only - requires Phaser integration test)', () => {
  it.skip('should create player with correct initial values', () => {})
  it.skip('should take damage and die when health reaches 0', () => {})
  it.skip('should not die when taking partial damage', () => {})
  it.skip('should respawn and reset state', () => {})
  it.skip('should get correct type', () => {})
  it.skip('should move left and flip', () => {})
  it.skip('should move right and not flip', () => {})
  it.skip('should stop movement', () => {})
  it.skip('should jump when on ground', () => {})
  it.skip('should not jump when in air', () => {})
})
