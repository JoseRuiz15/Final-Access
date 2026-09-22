import { describe, it, vi } from 'vitest'

vi.mock('@/stores/game.js', () => ({
  useGameStore: () => ({ vidas: 5, llaves: 0, enemigos: 0 }),
}))

describe('Enemy (logic only - requires Phaser integration test)', () => {
  it.skip('should create enemy with correct initial values', () => {})
  it.skip('should take damage and die when health reaches 0', () => {})
  it.skip('should not die when taking partial damage', () => {})
  it.skip('should get correct type', () => {})
  it.skip('should patrol between limits when no target', () => {})
  it.skip('should reverse direction at right limit', () => {})
  it.skip('should reverse direction at left limit', () => {})
})
