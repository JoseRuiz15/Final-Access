import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/stores/game.js', () => ({
  useGameStore: () => ({ vidas: 5, llaves: 0, enemigos: 0 }),
}))

describe('PiniaGameRepository (interface contract)', () => {
  let PiniaGameRepository
  let mockStore

  beforeEach(async () => {
    mockStore = { vidas: 5, llaves: 0, enemigos: 0 }
    vi.resetModules()
    vi.doMock('@/stores/game.js', () => ({
      useGameStore: () => mockStore,
    }))
    const mod = await import('../repositories/PiniaGameRepository.js')
    PiniaGameRepository = mod.default
  })

  it('should have vidas getter/setter that syncs with store', () => {
    const repo = new PiniaGameRepository()
    expect(repo.vidas).toBe(5)
    repo.vidas = 3
    expect(repo.vidas).toBe(3)
    expect(mockStore.vidas).toBe(3)
  })

  it('should have llaves getter/setter that syncs with store', () => {
    const repo = new PiniaGameRepository()
    expect(repo.llaves).toBe(0)
    repo.llaves = 2
    expect(repo.llaves).toBe(2)
    expect(mockStore.llaves).toBe(2)
  })

  it('should have enemigos getter/setter that syncs with store', () => {
    const repo = new PiniaGameRepository()
    expect(repo.enemigos).toBe(0)
    repo.enemigos = 5
    expect(repo.enemigos).toBe(5)
    expect(mockStore.enemigos).toBe(5)
  })

  it('should incrementarEnemigos updates both internal and store', () => {
    const repo = new PiniaGameRepository()
    expect(repo.enemigos).toBe(0)
    repo.incrementarEnemigos()
    expect(repo.enemigos).toBe(1)
    expect(mockStore.enemigos).toBe(1)
  })

  it('should reset all values to defaults', () => {
    const repo = new PiniaGameRepository()
    repo.vidas = 1
    repo.llaves = 10
    repo.enemigos = 20
    repo.reset()
    expect(repo.vidas).toBe(5)
    expect(repo.llaves).toBe(0)
    expect(repo.enemigos).toBe(0)
    expect(mockStore.vidas).toBe(5)
    expect(mockStore.llaves).toBe(0)
    expect(mockStore.enemigos).toBe(0)
  })
})
