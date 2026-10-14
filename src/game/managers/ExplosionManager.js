/**
 * Manager para explosiones - SRP
 * Encapsula la creación y animación de explosiones
 * Lazy init: recibe scene en init() porque no existe al instanciar en SceneFactory.
 */
export default class ExplosionManager {
  constructor() {
    this.scene = null
    this._initialized = false
  }

  init(scene) {
    if (this._initialized) return
    this.scene = scene
    this._initialized = true
  }

  _ensureInit() {
    if (!this._initialized) {
      throw new Error('ExplosionManager not initialized. Call init(scene) first.')
    }
  }

  create(x, y, texture = 'explosion') {
    this._ensureInit()
    const explosion = this.scene.add.sprite(x, y, texture)
    explosion.play('explosion')
    explosion.once('animationcomplete-explosion', () => explosion.destroy())
    return explosion
  }

  createAtEntity(entity, texture = 'explosion') {
    this._ensureInit()
    return this.create(entity.x, entity.y, texture)
  }
}
