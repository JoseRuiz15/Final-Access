import { describe, expect, it, vi } from 'vitest'

vi.mock('phaser', async () => import('./phaserMock.js'))
vi.mock('../factories/EntityFactory.js', () => ({
  default: { createAttackHitbox: vi.fn(), createKey: vi.fn(), createProjectile: vi.fn() },
}))
vi.mock('../services/EnemySoundEffects.js', () => ({
  loadEnemySoundEffects() {},
  playEnemySoundEffect() {},
}))

import Enemy from '../entities/enemy.js'
import { createRepository, createScene } from './entityTestHarness.js'

function createEnemy(config = {}) {
  const scene = createScene()
  const repository = createRepository()
  const enemy = new Enemy(scene, 800, 200, 'enemy', config, repository)
  return { scene, repository, enemy }
}

describe('Enemy entity logic', () => {
  it('creates an enemy with its configured health and speed', () => {
    const { enemy } = createEnemy({ vida: 60, velocidad: 75 })

    expect(enemy.getType()).toBe('enemy')
    expect(enemy.vida).toBe(60)
    expect(enemy.velocidad).toBe(75)
    expect(enemy.active).toBe(true)
  })

  it('takes damage and dies when health reaches zero', () => {
    const { enemy, repository } = createEnemy({ vida: 40, animDie: null })

    expect(enemy.takeDamage(40)).toBe(true)
    expect(enemy.vida).toBe(0)
    expect(enemy.muerto).toBe(true)
    expect(enemy.body.enable).toBe(false)
    expect(enemy.active).toBe(false)
    expect(repository.enemigos).toBe(1)
  })

  it('does not die when taking partial damage', () => {
    const { enemy, scene } = createEnemy({ vida: 40, animDamage: null })

    expect(enemy.takeDamage(10)).toBe(false)
    expect(enemy.vida).toBe(30)
    expect(enemy.muerto).toBe(false)
    expect(enemy.recibiendoDano).toBe(true)
    expect(scene.time.scheduledCalls).toHaveLength(1)
  })

  it('reports the enemy entity type', () => {
    const { enemy } = createEnemy()
    expect(enemy.getType()).toBe('enemy')
  })

  it('patrols between its limits when it has no target', () => {
    const { enemy } = createEnemy({ limiteIzquierdo: 650, limiteDerecho: 1050 })
    enemy.x = 800

    enemy.update(16)

    expect(enemy.body.velocity.x).toBe(50)
    expect(enemy.ai.direccion).toBe(1)
  })

  it('reverses direction at the right patrol limit', () => {
    const { enemy } = createEnemy({ limiteIzquierdo: 650, limiteDerecho: 1050 })
    enemy.x = 1050

    enemy.update(16)

    expect(enemy.ai.direccion).toBe(-1)
    expect(enemy.body.velocity.x).toBe(-50)
  })

  it('reverses direction at the left patrol limit', () => {
    const { enemy } = createEnemy({ limiteIzquierdo: 650, limiteDerecho: 1050 })
    enemy.x = 650
    enemy.ai.direccion = -1

    enemy.update(16)

    expect(enemy.ai.direccion).toBe(1)
    expect(enemy.body.velocity.x).toBe(50)
  })
})
