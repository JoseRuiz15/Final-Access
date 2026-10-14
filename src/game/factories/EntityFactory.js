import Player from '../entities/player.js'
import Enemy from '../entities/enemy.js'
import Box from '../entities/box.js'
import Key from '../entities/key.js'
import AttackHitbox from '../entities/attackHitbox.js'
import Projectile from './projectile.js'

/**
 * Factory central para crear entidades del juego.
 * OCP: para agregar nuevos tipos, se agrega un metodo nuevo
 * sin modificar codigo existente.
 * SRP: unica responsabilidad es crear entidades.
 * DIP: entidades no crean otras entidades directamente.
 */
export default class EntityFactory {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {string} texture
   * @param {IGameRepository} gameRepository
   * @returns {Player}
   */
  static createPlayer(scene, x, y, texture, gameRepository) {
    return new Player(scene, x, y, texture, gameRepository)
  }

  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {string} texture
   * @param {object} config
   * @param {IGameRepository} gameRepository
   * @returns {Enemy}
   */
  static createEnemy(scene, x, y, texture, config = {}, gameRepository = null) {
    const enemy = new Enemy(scene, x, y, texture, config, gameRepository)
    if (config.vida != null) enemy.vida = config.vida
    if (config.velocidad != null) enemy.velocidad = config.velocidad
    if (config.limiteIzquierdo != null) {
    enemy.limiteIzquierdo = config.limiteIzquierdo
    if (enemy.ai) enemy.ai.limiteIzquierdo = config.limiteIzquierdo
  }
    if (config.limiteDerecho != null) {
      enemy.limiteDerecho = config.limiteDerecho
      if (enemy.ai) enemy.ai.limiteDerecho = config.limiteDerecho
    }
    return enemy
  }

  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {object|null} keyData
   * @returns {Box}
   */
  static createBox(scene, x, y, keyData = null) {
    return new Box(scene, x, y, keyData)
  }

  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {string} texture
   * @param {object} datos
   * @returns {Key}
   */
  static createKey(scene, x, y, texture, datos) {
    return new Key(scene, x, y, texture, datos)
  }

  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {number} damage
   * @param {object} owner
   * @returns {AttackHitbox}
   */
  static createAttackHitbox(scene, x, y, damage, owner) {
    return new AttackHitbox(scene, x, y, 40, 30, damage, owner)
  }

  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {string} texture
   * @returns {Projectile}
   */
  static createProjectile(scene, x, y, texture) {
    return new Projectile(scene, x, y, texture)
  }

  /**
   * Enemigo tipo patrullero (rapido, poca vida).
   */
  static createPatrolEnemy(scene, x, y, texture) {
    return EntityFactory.createEnemy(scene, x, y, texture, {
      vida: 20,
      velocidad: 60,
    })
  }

  /**
   * Enemigo tipo tanque (lento, mucha vida).
   */
  static createTankEnemy(scene, x, y, texture) {
    return EntityFactory.createEnemy(scene, x, y, texture, {
      vida: 60,
      velocidad: 30,
    })
  }
}
