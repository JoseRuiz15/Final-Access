import EntityFactory from '../../factories/EntityFactory.js'

export default class InventoryComponent {
  constructor(player, gameRepository) {
    this.player = player
    this.gameRepository = gameRepository
    this.llaves = []
  }

  pickUp(llave)  {
    const keyData = {
      texture: llave.texture.key,
      grupo: llave.grupo,
      color: llave.color,
      efecto: llave.efecto,
      correcta: llave.correcta,
    }

    console.log('🔑 Llave recogida:', keyData, '| texture.key =', llave.texture.key)

    this.llaves.push(keyData)

    this.gameRepository.llaves = this.llaves.length
    console.log('Inventario:', this.llaves)
    llave.destroy()
  }

  devolverUltimaLlaveAlMapa(x, y, velocidadX = 0, velocidadY = 0) {
    const keyData = this.llaves[this.llaves.length - 1]
    if (!keyData) return false

    const scene = this.player.scene
    const keysGroup = scene.keyManager?.getKeysGroup()
    if (!keysGroup) return false

    const llave = EntityFactory.createKey(scene, x, y, keyData.texture, keyData)
    keysGroup.add(llave)
    llave.setVelocity(velocidadX, velocidadY)

    this.llaves.pop()
    this.gameRepository.llaves = this.llaves.length
    return true
  }

  getLlaves() {
    return this.llaves
  }
}
