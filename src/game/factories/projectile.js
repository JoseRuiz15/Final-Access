import Phaser from 'phaser'

class Projectile extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture)
    scene.add.existing(this)
    scene.physics.add.existing(this)
    this.body.setAllowGravity(false)
    this.velocidad = 350
    this.body.setSize(8, 6)
    this.body.setOffset(20, 20)
  }

  disparar(direccion) {
    this.play('proyectile', true)
    this.setVelocityX(direccion * this.velocidad)
    this.setFlipX(direccion < 0)
  }
}

export default Projectile
