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

    async devolverUltimaLlaveAlMapa(x, y) {
    const keyData = this.llaves.pop()
    if (!keyData) return

    this.gameRepository.llaves = this.llaves.length

    const scene = this.player.scene
    const keysGroup = scene.keyManager?.getKeysGroup()
    if (!keysGroup) return

    const llave = EntityFactory.createKey(scene, x, y, keyData.texture, keyData)
    keysGroup.add(llave)
  }

  getLlaves() {
    return this.llaves
  }
}
