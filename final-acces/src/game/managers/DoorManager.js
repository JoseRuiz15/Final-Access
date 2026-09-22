import Phaser from 'phaser'

/**
 * Manager para manejo de puertas - SRP
 * Encapsula toda la lógica de puertas: creación, proximidad, apertura
 * Lazy init: recibe scene en init() porque no existe al instanciar en SceneFactory.
 */
export default class DoorManager {
  constructor(config = {}) {
    this.scene = null
    this.config = config
    this.doorSprite = null
    this.doors = null
    this.doorLayerName = config.doorLayerName || 'DoorObjet'
    this._initialized = false
  }

  init(scene) {
    if (this._initialized) return
    this.scene = scene
    this._initialized = true
  }

  _ensureInit() {
    if (!this._initialized) {
      throw new Error('DoorManager not initialized. Call init(scene) first.')
    }
  }

  create(mapResult) {
    this._ensureInit()
    this.doors = mapResult?.objectLayers?.[this.doorLayerName]
    if (this.doors?.objects?.[0]) {
      const puerta = this.doors.objects[0]
      this.doorSprite = this.scene.add.image(puerta.x + 32, puerta.y + 32, 'redDoor')
    }
    return this.doorSprite
  }

  checkProximity(player, inputService) {
    this._ensureInit()
    if (!this.doors || !this.doorSprite || !player) return false

    let doorOpened = false
    this.doors.objects.forEach((puerta) => {
      const distancia = Phaser.Math.Distance.Between(player.x, player.y, puerta.x, puerta.y)
      if (distancia < 80) {
        const llaveNecesaria = puerta.properties?.find((p) => p.name === 'llave_necesaria')?.value
        const tieneLlave = player.llaves?.some((llave) => llave.texture === llaveNecesaria)

        if (inputService.isInteracting() && tieneLlave && !puerta.abierta) {
          this.doorSprite.setTexture('greenDoor')
          puerta.abierta = true
          doorOpened = true
        }
      }
    })
    return doorOpened
  }

  getDoorSprite() {
    return this.doorSprite
  }

  getDoors() {
    return this.doors
  }
}
