/**
 * Clase encargada de crear el mapa y las capas del Level 1.
 * Utiliza PhysicsService para configurar colisiones y grupos.
 */
export default class Level1Map {

  constructor(scene) {
    this.scene = scene
    this.groundLayer = null
    this.doors = null
    this.doorSprite = null
    this.map = null
  }

  create() {
    const map = this.scene.make.tilemap({ key: 'level1' })
    this.map = map

    const groundTiles = map.addTilesetImage('ground', 'ground')
    const decorationTiles = map.addTilesetImage('decorations', 'decorations')
    const boxTiles = map.addTilesetImage('box', 'box')
    const wallTiles = map.addTilesetImage('walls', 'walls')

    // Capas de fondo
    map.createLayer('BackGround', [groundTiles, decorationTiles, boxTiles])
    const wallsLayer = map.createLayer('Walls', [groundTiles, decorationTiles, boxTiles, wallTiles])
    wallsLayer.setCollisionByExclusion([-1])

    this.groundLayer = map.createLayer('Ground', [groundTiles, decorationTiles, boxTiles])
    this.groundLayer.setCollisionByExclusion([-1])

    this.doors = map.getObjectLayer('DoorObjet')
    this.doorSprite = this.scene.add.image(this.doors.objects[0].x + 32, this.doors.objects[0].y + 32, 'redDoor')

    // Configurar cámara y física
    this.scene.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels)
    this.scene.physicsService.setBounds(map.widthInPixels, map.heightInPixels)
  }

  getGroundLayer() {
    return this.groundLayer
  }

  getDoorsLayer() {
    return this.doors
  }

  getDoorSprite() {
    return this.doorSprite
  }

  getMapWidth() {
    return this.map?.widthInPixels || 0
  }

  getMapHeight() {
    return this.map?.heightInPixels || 0
  }
}