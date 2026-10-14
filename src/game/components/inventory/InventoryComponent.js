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

  getLlaves() {
    return this.llaves
  }
}
