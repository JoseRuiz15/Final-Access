import Entity from './Entity.js'

class Key extends Entity {
  constructor(scene, x, y, texture, datos) {
    super(scene, x, y, texture)

    this.grupo = datos.grupo
    this.color = datos.color
    this.efecto = datos.efecto
    this.correcta = datos.correcta

    scene.add.existing(this)
    scene.physics.add.existing(this)

    this.setCollideWorldBounds(true)
    this.setBounce(0.2)

    if (texture === 'key2') {
      this.play('key2Spin')
    }
  }

  pickUp(player) {
    player.recogerLlave(this)
    this.destroy()
  }

  getType() {
    return 'key'
  }
}

export default Key
