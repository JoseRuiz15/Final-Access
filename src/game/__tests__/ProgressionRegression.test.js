import { beforeEach, describe, expect, it, vi } from 'vitest'

const progressionApi = vi.hoisted(() => ({
  getProgress: vi.fn(),
  completeLevel: vi.fn(),
}))

vi.mock('@/api/client', () => ({ progressionApi }))

import { createPinia, setActivePinia } from 'pinia'
import { useProgressionStore } from '@/stores/progression'

describe('progression save regressions', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    progressionApi.getProgress.mockReset()
    progressionApi.completeLevel.mockReset()
  })

  it('does not mark a level complete when the save request fails', async () => {
    const store = useProgressionStore()
    store.setProgress({
      gameProgress: { currentLevelId: 4 },
      levelProgress: [{ levelId: 4, completed: false, stars: 0 }],
    })
    progressionApi.completeLevel.mockRejectedValueOnce(new Error('offline'))

    await expect(store.completeLevel(4, { stars: 3, timeSec: 60 })).rejects.toThrow('offline')

    expect(store.isLevelCompleted(4)).toBe(false)
    expect(store.getLevelStars(4)).toBe(0)
  })

  it('uses the server response as the saved completion record', async () => {
    const store = useProgressionStore()
    store.setProgress({
      gameProgress: { currentLevelId: 4 },
      levelProgress: [{ levelId: 4, completed: false, stars: 0 }],
    })
    progressionApi.completeLevel.mockResolvedValueOnce({
      data: {
        ok: true,
        gameProgress: { currentLevelId: 5 },
        levelProgress: { levelId: 4, completed: true, stars: 2, bestTimeSec: 61 },
      },
    })

    await store.completeLevel(4, { stars: 2, timeSec: 61 })

    expect(store.gameProgress.currentLevelId).toBe(5)
    expect(store.isLevelCompleted(4)).toBe(true)
    expect(store.getLevelStars(4)).toBe(2)
    expect(store.getBestTime(4)).toBe(61)
  })

  it('rejects a success-shaped response that does not confirm the level record', async () => {
    const store = useProgressionStore()
    progressionApi.completeLevel.mockResolvedValueOnce({ data: { ok: true } })

    await expect(store.completeLevel(4, { stars: 3, timeSec: 60 })).rejects.toThrow(
      'El servidor no confirmó el progreso.',
    )

    expect(store.isLevelCompleted(4)).toBe(false)
  })

  it('removes local completions omitted from the authoritative server response', async () => {
    const store = useProgressionStore()
    store.setProgress({
      gameProgress: { currentLevelId: 5 },
      levelProgress: [{ levelId: 4, completed: true, stars: 3 }],
    })
    progressionApi.getProgress.mockResolvedValueOnce({
      data: { ok: true, gameProgress: { currentLevelId: 4 }, levelProgress: [] },
    })

    await store.fetchProgress()

    expect(store.isLevelCompleted(4)).toBe(false)
    expect(store.levelProgress).toEqual([])
  })

  it('treats a non-ok progress response as a load failure', async () => {
    const store = useProgressionStore()
    progressionApi.getProgress.mockResolvedValueOnce({ data: { ok: false } })

    await expect(store.fetchProgress()).rejects.toThrow(
      'El servidor no pudo cargar el progreso.',
    )
    expect(store.isLoading).toBe(false)
  })
})
