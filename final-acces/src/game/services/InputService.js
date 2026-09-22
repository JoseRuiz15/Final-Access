import Phaser from 'phaser'

/**
 * Encapsula toda la entrada de teclado.
 * Principio SRP: unica responsabilidad es gestionar o declarar las entradas.
 * Principio DIP: los controllers dependen de esta abstraccion.
 */
export default class InputService {
  constructor(scene = null) {
    this.scene = scene
    this._keys = null
    this._initialized = false
    if (scene) this.init(scene)
  }

  init(scene) {
    if (this._initialized) return
    this.scene = scene
    this._keys = scene.input.keyboard.addKeys({
      W: Phaser.Input.Keyboard.KeyCodes.W,
      A: Phaser.Input.Keyboard.KeyCodes.A,
      S: Phaser.Input.Keyboard.KeyCodes.S,
      D: Phaser.Input.Keyboard.KeyCodes.D,
      SPACE: Phaser.Input.Keyboard.KeyCodes.SPACE,
      L: Phaser.Input.Keyboard.KeyCodes.L,
      G: Phaser.Input.Keyboard.KeyCodes.G,
    })
    this._initialized = true
  }

  _ensureInit() {
    if (!this._initialized || !this.scene) {
      throw new Error('InputService not initialized. Call init(scene) first.')
    }
  }

  isMovingLeft() {
    this._ensureInit()
    return this._keys.A.isDown
  }

  isMovingRight() {
    this._ensureInit()
    return this._keys.D.isDown
  }

  isJumping() {
    this._ensureInit()
    return this._keys.SPACE.isDown || this._keys.W.isDown
  }

  isAttacking() {
    this._ensureInit()
    return Phaser.Input.Keyboard.JustDown(this._keys.L)
  }

  isInteracting() {
    this._ensureInit()
    return Phaser.Input.Keyboard.JustDown(this._keys.G)
  }

  getKey(keyCode) {
    this._ensureInit()
    return this._keys[keyCode]
  }
}
