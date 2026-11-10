import { describe, expect, it, vi } from 'vitest'

vi.mock('phaser', async () => import('./phaserMock.js'))
vi.mock('../services/PlayerSoundEffects.js', () => ({
  loadPlayerSoundEffects() {},
  playPlayerSoundEffect() {},
}))
vi.mock('../services/EnemySoundEffects.js', () => ({
  loadEnemySoundEffects() {},
}))

import BaseScene from '../scenes/BaseScene.js'
import DoorManager from '../managers/DoorManager.js'
import KeyManager from '../managers/KeyManager.js'
import { createScene } from './entityTestHarness.js'

describe('game over guards', () => {
  it('stops the scene update before input, keys, or doors run for a dead player', () => {
    const scene = new BaseScene('level-test', {}, { gameRepository: { vidas: 0 } })
    scene.player = { active: true, muerto: true }
    scene.playerController = { handleInput: vi.fn() }
    scene.keyManager = { update: vi.fn() }
    scene.doorManager = { checkProximity: vi.fn() }

    scene.update()

    expect(scene.playerController.handleInput).not.toHaveBeenCalled()
    expect(scene.keyManager.update).not.toHaveBeenCalled()
    expect(scene.doorManager.checkProximity).not.toHaveBeenCalled()
  })

  it('pauses and emits game over when the last life is lost', () => {
    const scene = new BaseScene('level-test', {}, { gameRepository: { vidas: 0 } })
    scene.player = { body: { enable: true, stop: vi.fn() } }
    scene.events = { emit: vi.fn() }
    scene.game = { events: { emit: vi.fn() } }
    scene.scene = { pause: vi.fn() }

    scene.onPlayerDeath()

    expect(scene.gameOver).toBe(true)
    expect(scene.player.body.enable).toBe(false)
    expect(scene.player.body.stop).toHaveBeenCalledOnce()
    expect(scene.events.emit).toHaveBeenCalledWith('game-over')
    expect(scene.game.events.emit).toHaveBeenCalledWith('game-over', scene)
    expect(scene.scene.pause).toHaveBeenCalledOnce()
  })

  it('does not open a door for a dead player even when the interaction key is held', () => {
    const scene = createScene()
    scene.gameRepository = { vidas: 0 }
    const manager = new DoorManager()
    manager.init(scene)
    manager.doors = { objects: [{ x: 10, y: 10, width: 40, height: 40 }] }
    manager.doorSprite = { setTexture: vi.fn() }
    const player = { active: true, muerto: true, vidas: 0, x: 20, y: 20, llaves: [] }
    const input = { isInteracting: vi.fn(() => true) }

    expect(manager.checkProximity(player, input)).toBe(false)
    expect(input.isInteracting).not.toHaveBeenCalled()
    expect(manager.doorSprite.setTexture).not.toHaveBeenCalled()
  })

  it('does not collect a key for a dead player', () => {
    const scene = createScene()
    scene.gameRepository = { vidas: 0 }
    const manager = new KeyManager()
    manager.init(scene)
    manager.llaveCercana = { id: 'old-nearby-key' }
    manager.keysGroup = { getChildren: vi.fn(() => []) }
    const player = { active: true, muerto: true, vidas: 0 }
    const input = { isInteracting: vi.fn(() => true) }

    manager.update(player, input)

    expect(manager.llaveCercana).toBe(null)
    expect(manager.keysGroup.getChildren).not.toHaveBeenCalled()
    expect(input.isInteracting).not.toHaveBeenCalled()
  })
})
