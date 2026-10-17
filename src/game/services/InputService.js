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
  this.scene = scene

  const keyboard = scene.input.keyboard
  // El nivel puede abrirse desde un botón Vue que conserva el foco del teclado.
  // Volvemos a activar el plugin al inicializar cada escena.
  keyboard.enabled = true

  // Descarta las referencias a teclas del ciclo anterior de la escena.
  keyboard.removeAllKeys(true)

  // Registra teclas nuevas para la escena reiniciada.
  this._keys = keyboard.addKeys({
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
    // Un salto por pulsación: mantener SPACE o W no provoca otro salto al aterrizar.
    const spacePressed = Phaser.Input.Keyboard.JustDown(this._keys.SPACE)
    const wPressed = Phaser.Input.Keyboard.JustDown(this._keys.W)
    return spacePressed || wPressed
  }

  isAttacking() {
    this._ensureInit()
    return Phaser.Input.Keyboard.JustDown(this._keys.L)
  }

  isInteracting() {
    this._ensureInit()
        
        // 👇 DEBUG + CACHE por frame (evita doble consumo de JustDown)
        const currentFrame = this.scene.game.loop.frame
        if (currentFrame !== this._lastFrame) {
          this._interactingThisFrame = Phaser.Input.Keyboard.JustDown(this._keys.G)
          this._lastFrame = currentFrame
        }
        
        return this._interactingThisFrame
      }

  getKey(keyCode) {
    this._ensureInit()
    return this._keys[keyCode]
  }
}
