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

    // Cada mapa tiene una capa de puerta registrada en su propia configuración.
    // Nivel 1 conserva el nombre histórico "DoorObjet" y nivel 2 usa "DoorObject".
    const capasConfiguradas = this.scene.config?.map?.objectLayers ?? []
    const nombresCandidatos = [
      this.doorLayerName,
      ...capasConfiguradas.filter((nombre) => /door/i.test(nombre)),
      'DoorObjet',
      'DoorObject',
    ]
    const nombreCapa = nombresCandidatos.find((nombre) =>
      mapResult?.objectLayers?.[nombre]?.objects?.length,
    )

    this.doors = nombreCapa ? mapResult.objectLayers[nombreCapa] : null

    const puerta = this.doors?.objects?.find((objeto) => objeto.visible !== false)
    if (puerta) {
      // Tiled da la esquina superior izquierda; Phaser ubica la imagen por el centro.
      const ancho = puerta.width ?? 64
      const alto = puerta.height ?? 64
      this.doorSprite = this.scene.add.image(
        puerta.x + ancho / 2,
        puerta.y + alto / 2,
        'redDoor',
      )
      // La compuerta del nivel 3 ocupa 256x128; el sprite debe cubrirla entera.
      this.doorSprite.setDisplaySize(ancho, alto)
      // Las capas del mapa están en profundidad 0; jugadores y enemigos usan 1.
      // Así la puerta queda visible sobre el mapa, pero detrás de las entidades.
      this.doorSprite.setDepth(0)
      this.doorSprite.setVisible(true)
    }

    return this.doorSprite
  }

  checkProximity(player, inputService) {
    this._ensureInit()
    if (!this.doors || !this.doorSprite || !player) return false

    let doorOpened = false
    this.doors.objects.forEach((puerta) => {
      // Mide la distancia al rectángulo de la puerta: con la compuerta grande
      // del nivel 3, el jugador puede pulsar G en cualquier punto de su base.
      const ancho = puerta.width ?? 64
      const alto = puerta.height ?? 64
      const masCercanoX = Phaser.Math.Clamp(player.x, puerta.x, puerta.x + ancho)
      const masCercanoY = Phaser.Math.Clamp(player.y, puerta.y, puerta.y + alto)
      const distancia = Phaser.Math.Distance.Between(
        player.x,
        player.y,
        masCercanoX,
        masCercanoY,
      )
      if (distancia < 80) {
        const llaveNecesaria = puerta.properties?.find((p) => p.name === 'llave_necesaria')?.value
        const tieneLlave = player.llaves?.some((llave) => llave.texture === llaveNecesaria)

        if (inputService.isInteracting() && tieneLlave && !puerta.abierta) {
          this.doorSprite.setTexture('greenDoor')
          puerta.abierta = true
          doorOpened = true
          console.log('✅ PUERTA ABIERTA - VERDE')
          this.scene.game?.events?.emit('level-completed', this.scene)
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
//prueba de commit
