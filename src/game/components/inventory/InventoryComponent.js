import EntityFactory from '../../factories/EntityFactory.js'
import { playPlayerSoundEffect } from '../../services/PlayerSoundEffects.js'

export default class InventoryComponent {
  constructor(player, gameRepository) {
    this.player = player
    this.gameRepository = gameRepository
    this.llaves = []
  }

  pickUp(llave) {
    const keyData = {
      texture: llave.texture.key,
      grupo: llave.grupo,
      color: llave.color,
      efecto: llave.efecto,
      correcta: llave.correcta,
      spawnX: llave.spawnX,
      spawnY: llave.spawnY,
      multiplayerId: llave.multiplayerId ?? null,
    }

    console.log('🔑 Llave recogida:', keyData, '| texture.key =', llave.texture.key)

    this.llaves.push(keyData)
    this._syncRepository()
    playPlayerSoundEffect(this.player.scene, 'getKey')
    if (keyData.multiplayerId) {
      this.player.scene.events?.emit('key-picked-up', keyData)
    }

    console.log('Inventario:', this.llaves)
    llave.destroy()
  }

  _syncRepository() {
    this.gameRepository.llaves = this.llaves.length
    this.gameRepository.llavesCorrectas = this.llaves.filter((llave) => llave.correcta).length
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
    this._syncRepository()
    playPlayerSoundEffect(scene, 'dropKey')
    if (keyData.multiplayerId) {
      scene.events?.emit('key-dropped', { keyData, x, y })
    }
    return true
  }

  setSharedKeys(keys = []) {
    this.llaves = keys.map((key) => ({ ...key }))
    this._syncRepository()
  }

  getLlaves() {
    return this.llaves
  }
}
