import { describe, expect, it, vi } from 'vitest'

vi.mock('phaser', async () => import('./phaserMock.js'))
vi.mock('../factories/EntityFactory.js', () => ({
  default: { createAttackHitbox: vi.fn(), createKey: vi.fn(), createProjectile: vi.fn() },
}))
vi.mock('../services/PlayerSoundEffects.js', () => ({
  createPlayerSoundLoop: () => ({
    isPlaying: false,
    play() {
      this.isPlaying = true
    },
    stop() {
      this.isPlaying = false
    },
    destroy() {},
  }),
  loadPlayerSoundEffects() {},
  playPlayerSoundEffect() {},
}))

import Player from '../entities/player.js'
import { createRepository, createScene } from './entityTestHarness.js'

function createPlayer() {
  const scene = createScene()
  const repository = createRepository()
  const player = new Player(scene, 120, 240, 'player', repository)
  return { scene, repository, player }
}

describe('Player entity logic', () => {
  it('creates the player with initial health, lives, movement speed, and spawn position', () => {
    const { player } = createPlayer()

    expect(player.getType()).toBe('player')
    expect(player.vida).toBe(100)
    expect(player.maxVida).toBe(100)
    expect(player.vidas).toBe(5)
    expect(player.velocidad).toBe(160)
    expect(player.spawnX).toBe(120)
    expect(player.spawnY).toBe(240)
  })

  it('takes damage and dies when health reaches zero', () => {
    const { player } = createPlayer()

    expect(player.takeDamage(100)).toBe(true)
    expect(player.vida).toBe(0)
    expect(player.muerto).toBe(true)
  })

  it('does not die when taking partial damage', () => {
    const { player } = createPlayer()

    expect(player.takeDamage(35)).toBe(false)
    expect(player.vida).toBe(65)
    expect(player.muerto).toBe(false)
    expect(player.recibiendoDano).toBe(true)
  })

  it('respawns with full health and clears its dead state', () => {
    const { player } = createPlayer()
    player.health.vida = 0
    player.muerto = true
    player.body.enable = false
    player.setPosition(500, 600)

    player.respawn()

    expect(player.getPosition()).toEqual({ x: 120, y: 240 })
    expect(player.vida).toBe(100)
    expect(player.muerto).toBe(false)
    expect(player.active).toBe(true)
    expect(player.visible).toBe(true)
    expect(player.body.enable).toBe(true)
  })

  it('reports the player entity type', () => {
    const { player } = createPlayer()
    expect(player.getType()).toBe('player')
  })

  it('moves left and flips the sprite', () => {
    const { player } = createPlayer()
    player.body.grounded = true

    player.moverIzquierda()

    expect(player.body.velocity.x).toBe(-160)
    expect(player.flipX).toBe(true)
  })

  it('moves right without flipping the sprite', () => {
    const { player } = createPlayer()
    player.body.grounded = true

    player.moverDerecha()

    expect(player.body.velocity.x).toBe(160)
    expect(player.flipX).toBe(false)
  })

  it('stops horizontal movement while grounded', () => {
    const { player } = createPlayer()
    player.body.grounded = true
    player.moverDerecha()

    player.detenerMovimiento()

    expect(player.body.velocity.x).toBe(0)
    expect(player.texture.key).toBe('player')
  })

  it('jumps when grounded', () => {
    const { player } = createPlayer()
    player.body.grounded = true

    player.saltar()

    expect(player.body.velocity.y).toBe(-500)
    expect(player.anims.currentAnim.key).toBe('saltar')
  })

  it('does not jump while airborne without coyote time remaining', () => {
    const { player } = createPlayer()
    player.body.grounded = false

    player.saltar()

    expect(player.body.velocity.y).toBe(0)
    expect(player.anims.currentAnim).toBe(null)
  })
})
