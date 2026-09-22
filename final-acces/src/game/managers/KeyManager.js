import Phaser from 'phaser'
import Key from '../entities/key.js'

/**
 * Manager para manejo de llaves - SRP
 * Encapsula toda la lógica de llaves: spawn, proximidad, recolección
 * Lazy init: recibe scene en init() porque no existe al instanciar en SceneFactory.
 */
export default class KeyManager {
  constructor(config = {}) {
    this.scene = null
    this.config = config
    this.keysGroup = null
    this.llaveCercana = null
    this.imgRecogerLlave = null
    this._initialized = false
  }

  init(scene) {
    if (this._initialized) return
    this.scene = scene
    this._initialized = true
  }

  _ensureInit() {
    if (!this._initialized) {
      throw new Error('KeyManager not initialized. Call init(scene) first.')
    }
  }

  create(keyClass = null) {
    this._ensureInit()
    const KeyClass = keyClass || this._getKeyClass()
    this.keysGroup = this.scene.physics.add.group({ classType: KeyClass })

    // UI para recoger llave
    this.imgRecogerLlave = this.scene.add.image(0, 0, 'imgRecogerLlave')
    this.imgRecogerLlave.setScale(0.25)
    this.imgRecogerLlave.setDepth(1000)
    this.imgRecogerLlave.setVisible(false)

    return this.keysGroup
  }

  _getKeyClass() {
    return Key
  }

  update(player, inputService) {
    this._ensureInit()
    if (!this.keysGroup || !player || !this.imgRecogerLlave) return

    this.llaveCercana = null
    this.keysGroup.getChildren().forEach((llave) => {
      const distancia = Phaser.Math.Distance.Between(player.x, player.y, llave.x, llave.y)
      if (distancia < 80) {
        this.llaveCercana = llave
        this.imgRecogerLlave.setPosition(llave.x, llave.y - 40)
        this.imgRecogerLlave.setVisible(true)
      }
    })

    if (!this.llaveCercana) {
      this.imgRecogerLlave.setVisible(false)
    }

    // Recoger llave
    if (inputService.isInteracting() && this.llaveCercana) {
      player.recogerLlave(this.llaveCercana)
      this.llaveCercana = null
      this.imgRecogerLlave.setVisible(false)
    }
  }

  getKeysGroup() {
    return this.keysGroup
  }

  getImgRecogerLlave() {
    return this.imgRecogerLlave
  }
}
