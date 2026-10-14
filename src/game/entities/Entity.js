import Phaser from 'phaser'

/**
 * Clase base abstracta para entidades del juego.
 * Player y Enemy la extienden para reutilizar código común.
 *
 * Principio OCP: Para nuevos tipos de entidades, crear subclases de Entity
 * sin modificar código existente.
 */
export default class Entity extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture)
    this.scene = scene
  }

  /**
   * @returns {{x: number, y: number}}
   */
  getPosition() {
    return { x: this.x, y: this.y }
  }

  /**
   * @returns {number}
   */
  getHealth() {
    return this.vida
  }

  /**
   * @returns {boolean}
   */
  isAlive() {
    return this.vida > 0
  }

  /**
   * @param {number} amount
   * @returns {boolean} true si murio
   */
  takeDamage(amount) {
    this.vida -= amount
    if (this.vida < 0) {
      this.vida = 0
    }
    return this.vida <= 0
  }

  /**
   * @param {number} _delta
   */
  update(_delta) {}

  /**
   * @returns {Phaser.Textures.Texture}
   */
  getTexture() {
    return this.texture
  }

  /**
   * @returns {string}
   */
  getType() {
    return 'entity'
  }
}
