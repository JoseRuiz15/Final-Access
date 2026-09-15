import Key from '../../entities/key.js'

/**
 * Clase encargada de la interacción jugador - llaves - puertas.
 * Maneja el pickup de llaves y la apertura de puertas.
 */
export default class Level1Interaction {

  constructor(scene, entities, map) {
    this.scene = scene
    this.entities = entities
    this.map = map
    this.llaveCercana = null
    this.imgRecogerLlave = null
    this.imgInsertarLlave = null
  }

  init() {
    // Crear elemento visual para mostrar llave cercana
    this.imgRecogerLlave = this.scene.add.image(0, 0, 'imgRecogerLlave')
    this.imgRecogerLlave.setScale(0.25)
    this.imgRecogerLlave.setDepth(1000)
    this.imgRecogerLlave.setVisible(false)

    // Detectar llave cercana en update - Key class ya está disponible globalmente via preload
    this.scene.keys = this.scene.physics.add.group({ classType: Key })
  }

  update(inputService) {
    const player = this.entities.getPlayer()
    if (!player) return

    // Lógica de llave cercana
    this.scene.keys.getChildren().forEach((llave) => {
      const distancia = Phaser.Math.Distance.Between(player.x, player.y, llave.x, llave.y)
      if (distancia < 80) {
        this.llaveCercana = llave
        this.imgRecogerLlave.setPosition(llave.x, llave.y - 40)
        this.imgRecogerLlave.setVisible(true)
      } else {
        this.llaveCercana = null
        this.imgRecogerLlave.setVisible(false)
      }
    })

    // Tecla G para recoger llave
    if (inputService.isInteracting() && this.llaveCercana) {
      player.recogerLlave(this.llaveCercana)
      this.llaveCercana = null
      this.imgRecogerLlave.setVisible(false)
    }
  }
}